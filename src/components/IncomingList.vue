<template>
  <div>
    <!-- Add Incoming Form -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>Add Incoming</h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitIncoming">
          <div class="row g-3">
            <div class="col-md-2">
              <label for="plantationId" class="form-label">Plantation</label>
              <select v-model="newIncoming.plantationId" class="form-select" id="plantationId">
                <option v-for="option in plantationOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="date" class="form-label">Date</label>
              <input v-model="newIncoming.date" type="datetime-local" class="form-control" id="date" />
            </div>
            <div class="col-md-2">
              <label for="weight" class="form-label">Weight</label>
              <input v-model="newIncoming.weight" type="number"  step="0.01" class="form-control" id="weight" />
            </div>
            <div class="col-md-2">
              <label for="price" class="form-label">Price</label>
              <input v-model="newIncoming.price" type="number"  step="0.01" class="form-control" id="price" />
            </div>
            <div class="col-md-2">
              <label for="incomingTermId" class="form-label">Term</label>
              <select v-model="newIncoming.incomingTermId" class="form-select" id="incomingTermId">
                <option v-for="option in incomingTypeOptions" :key="option.value" :value="option.value">
                  {{ option.text }}
                </option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="buyerName" class="form-label">Buyer</label>
              <input v-model="newIncoming.buyerName" type="text" class="form-control" id="buyerName" />
            </div>
            <div class="col-md-12">
              <label for="note" class="form-label">Note</label>
              <input v-model="newIncoming.note" type="text" class="form-control" id="note" />
            </div>
            <div class="col-md-12">
              <button type="submit" class="btn btn-primary">Add</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>Filters</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="filterPlantationId" class="form-label">Plantation</label>
            <select v-model="filters.plantationId" class="form-select" id="filterPlantationId">
              <option :value="null">All</option>
              <option v-for="option in plantationOptions" :key="option.value" :value="option.value">
                {{ option.text }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="filterDateFrom" class="form-label">Date From</label>
            <input type="date" v-model="filters.dateFrom" class="form-control" id="filterDateFrom" />
          </div>
          <div class="col-md-4">
            <label for="filterDateTo" class="form-label">Date To</label>
            <input type="date" v-model="filters.dateTo" class="form-control" id="filterDateTo" />
          </div>
          <div class="col-md-12">
            <button @click="getIncomingList" class="btn btn-success">Apply Filters</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success and Error Messages -->
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>

    <!-- Incoming List Table -->
    <div class="card">
      <div class="card-body">
        <h5>Incoming Total: {{ total }} | Average Price: {{ averagePrice.toFixed(2) }}</h5>
        <table class="table table-striped table-hover">
          <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Plantation</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Buyer</th>
            <th>Note</th>
            <th>Paid</th>
            <th>Date Paid</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in incomingList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              <input v-model="item.date" type="datetime-local" class="form-control" />
            </td>
            <td>
              <input v-model="item.plantationName" type="text" class="form-control" />
            </td>
            <td>
              <input v-model="item.weight" type="number"  step="0.01" class="form-control" />
            </td>
            <td>
              <input v-model="item.price" type="number"  step="0.01" class="form-control" />
            </td>
            <td>{{ item.amount }}</td>
            <td>{{ item.incomingTypeName }}</td>
            <td>
              <input v-model="item.buyerName" type="text" class="form-control" />
            </td>
            <td>
              <input v-model="item.note" type="text" class="form-control" />
            </td>
            <td>
              <input type="checkbox" v-model="item.paid" />
            </td>
            <td>
              <input v-model="item.datePaid" type="datetime-local" class="form-control" />
            </td>
            <td>
              <button @click="editIncoming(item)" class="btn btn-warning btn-sm">Save</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>

import api from "@/services/api";

export default {
  data() {
    return {
      incomingList: [],
      total: 0,
      averagePrice: 0,
      error: null,
      successMessage: null,
      messageTimeout: null,
      filters: {
        plantationId: null,
        dateFrom: null,
        dateTo: null,
      },
      newIncoming: {
        plantationId: null,
        date: null,
        weight: null,
        price: null,
        incomingTermId: null,
        buyerName: '',
        note: '',
      },
      plantationOptions: [],
      incomingTypeOptions: [],
    };
  },
  mounted() {
    this.loadOptions();
  },
  methods: {
    async loadOptions() {
      try {
        const [plantRes, typeRes] = await Promise.all([
          api.post("/plantation/list", {'ids': []}),
          api.get("/incoming_term_type/list"),
        ]);
        this.plantationOptions = plantRes.data.plantations.map(p => ({
          value: p.id,
          text: p.name,
        }));
        this.incomingTypeOptions = typeRes.data.incomingTermTypes.map(t => ({
          value: t.value,
          text: t.label,
        }));
      } catch (err) {
        this.setMessage("Failed loading options");
      }
    },
    async getIncomingList() {
      try {
        const res = await api.post("/incoming/list", this.filters);
        this.incomingList = res.data.incoming;
        this.total = res.data.total;
        this.averagePrice = res.data.averagePrice;
      } catch (err) {
        this.setMessage("Error fetching incoming list");
      }
    },
    async submitIncoming() {
      try {
        const payload = {
          ...this.newIncoming,
          date: this.formatDateTime(this.newIncoming.date),
          price: parseFloat(this.newIncoming.price),
          weight: parseFloat(this.newIncoming.weight),
        };
        await api.post("/incoming/add", payload);
        this.setMessage("Incoming added", "success");
        this.getIncomingList();
      } catch (err) {
        this.setMessage("Error adding incoming");
      }
    },
    async editIncoming(item) {
      try {
        const payload = {
          ...item,
          date: this.formatDateTime(item.date),
          datePaid: item.datePaid ? this.formatDateTime(item.datePaid) : null,
          price: parseFloat(item.price),
          weight: parseFloat(item.weight),
        };
        await api.post("/incoming/edit", payload);
        this.setMessage("Incoming updated", "success");
        this.getIncomingList();
      } catch (err) {
        this.setMessage("Error updating incoming");
      }
    },

    formatDateTime(value) {
      if (!value) return null;
      const date = new Date(value);
      return date.toISOString().slice(0, 19).replace("T", " ");
    },
    setMessage(text, type = "error") {
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      if (type === "success") this.successMessage = text;
      if (type === "error") this.error = text;
      this.messageTimeout = setTimeout(() => {
        this.successMessage = null;
        this.error = null;
      }, 20000);
    },
  },
};
</script>

<style scoped>
table td input {
  width: 100%;
}
</style>
