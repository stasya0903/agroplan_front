<template>
  <div>
    <!-- Add Spending Form -->
    <div class="card p-3 mb-4">
      <h5 class="mb-3">Add Spending</h5>
      <div class="row gx-2 gy-2 align-items-end">
        <div class="col-md-2">
          <label class="form-label">Date</label>
          <input type="datetime-local" v-model="newSpending.date" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Amount</label>
          <input type="number" v-model="newSpending.amount" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Plantation</label>
          <select v-model="newSpending.plantationId" class="form-select">
            <option v-for="p in plantations" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Spending Type</label>
          <select v-model="newSpending.spendingTypeId" class="form-select">
            <option v-for="t in spendingTypes" :key="t.id" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Note</label>
          <input type="text" v-model="newSpending.note" class="form-control" />
        </div>
        <div class="col-md-1">
          <button class="btn btn-success w-100" @click="addSpending">Add</button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-3 mb-4">
      <h5 class="mb-3">Filters</h5>
      <div class="row gx-2 gy-2">
        <div class="col-md-3">
          <label class="form-label">Plantation</label>
          <select v-model="filters.plantationId" class="form-select">
            <option :value="null">All</option>
            <option v-for="p in plantations" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Spending Type</label>
          <select v-model="filters.spendingTypeId" class="form-select">
            <option :value="null">All</option>
            <option v-for="t in spendingTypes" :key="t.id" :value="t.value">{{ t.label }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Date From</label>
          <input type="date" v-model="filters.dateFrom" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Date To</label>
          <input type="date" v-model="filters.dateTo" class="form-control" />
        </div>
      </div>
      <button class="btn btn-primary mt-3" @click="loadSpendings">Apply Filters</button>
    </div>
    <!-- Messages -->
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <!-- Spending List -->
    <div class="card p-3">
      <h5>Spending List (Total: {{ total }})</h5>
      <table class="table table-bordered mt-3">
        <thead>
        <tr>
          <th>Date</th>
          <th>Amount</th>
          <th>Plantation</th>
          <th>Spending Type</th>
          <th>Note</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(s) in spendings" :key="s.id">
            <td><input v-model="s.date" class="form-control" type="datetime-local" /></td>
            <td><input v-model.number="s.amount" class="form-control" type="number" /></td>
            <td>
              <select v-model="s.plantationId" class="form-select">
                <option v-for="p in plantations" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </td>
            <td>
              <select v-model="s.spendingTypeId" class="form-select">
                <option v-for="t in spendingTypes" :key="t.id" :value="t.value">{{ t.label }}</option>
              </select>
            </td>
            <td><input v-model="s.note" class="form-control" /></td>
            <td>
              <button class="btn btn-sm btn-primary" @click="editSpending(s)">Save</button>
            </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      plantations: [],
      spendingTypes: [],
      spendings: [],
      filters: {
        plantationId: null,
        spendingTypeId: null,
        dateFrom: null,
        dateTo: null
      },
      newSpending: {
        date: null,
        amount: null,
        plantationId: null,
        spendingTypeId: null,
        note: null
      },
      total: 0,
      successMessage: null,
      error: null,
      messageTimeout: null
    }
  },
  mounted() {
    this.loadPlantations()
    this.loadSpendingTypes()
  },
  methods: {
    loadPlantations() {
      api.post('/plantation/list', {'ids': []}).then(res => {
        this.plantations = res.data.plantations || []
      })
    },
    loadSpendingTypes() {
      api.get('/spending_type/list',{'ids': []}).then(res => {
        this.spendingTypes = res.data.spendingTypes || []
      })
    },
    loadSpendings() {
      api.post('/spending/list', this.filters).then(res => {
        this.spendings = res.data.spending || []
        this.total = res.data.total || 0
      }).catch((error) => this.setMessage(error.response?.data?.message ||'Error loading spendings'))
    },
    addSpending() {
      const payload = {
        ...this.newSpending,
        amount: parseFloat(this.newSpending.amount),
        date: this.formatDateTime(this.newSpending.date)
      }
      api.post('/spending/add', payload).then(() => {
        this.setMessage('Spending added successfully', 'success')
        this.loadSpendings()
        this.newSpending = {
          date: null,
          amount: null,
          plantationId: null,
          spendingTypeId: null,
          note: null
        }
      }).catch((error) => this.setMessage(error.response?.data?.message || 'Error adding spending'))
    },
    editSpending(spending) {
      api.post('/spending/edit', {
        spendingId: spending.id,
        plantationId: spending.plantationId,
        spendingTypeId: spending.spendingTypeId,
        note: spending.note,
        amount: parseFloat(spending.amount),
        date: this.formatDateTime(spending.date)
      }).then(() => {
        this.loadSpendings()
        this.setMessage('Spending updated successfully', 'success')
      }).catch((error) => this.setMessage(error.response?.data?.message || 'Error updating spending' ))
    },
    formatDateTime(value) {
      if (!value) return null
      const date = new Date(value)
      return date.toISOString().slice(0, 19).replace('T', ' ')
    },
    setMessage(text, type = 'error') {
      if (this.messageTimeout) clearTimeout(this.messageTimeout)
      if (type === 'success') this.successMessage = text
      if (type === 'error') this.error = text
      this.messageTimeout = setTimeout(() => {
        this.successMessage = null
        this.error = null
      }, 20000)
    }
  }
}
</script>
