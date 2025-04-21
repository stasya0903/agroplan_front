<template>
  <div class="container mt-4">
    <h2>Worker Shifts</h2>

    <!-- Filters -->
    <div class="card p-3 mb-3">
      <div class="row g-3">
        <div class="col">
          <label>Worker</label>
          <select v-model="filters.workerId" class="form-select">
            <option :value="null">All</option>
            <option v-for="worker in workers" :key="worker.id" :value="worker.id">
              {{ worker.name }}
            </option>
          </select>
        </div>
        <div class="col">
          <label>Plantation</label>
          <select v-model="filters.plantationId" class="form-select">
            <option :value="null">All</option>
            <option v-for="plantation in plantations" :key="plantation.id" :value="plantation.id">
              {{ plantation.name }}
            </option>
          </select>
        </div>
        <div class="col">
          <label>Date From</label>
          <input type="date" v-model="filters.dateFrom" class="form-control" />
        </div>
        <div class="col">
          <label>Date To</label>
          <input type="date" v-model="filters.dateTo" class="form-control" />
        </div>
        <div class="col">
          <label>Paid</label>
          <select v-model="filters.paid" class="form-select">
            <option :value="null">All</option>
            <option :value="false">Unpaid</option>
            <option :value="true">Paid</option>
          </select>
        </div>
        <div class="col">
          <button class="btn btn-primary mt-4" @click="fetchShifts">Filter</button>
        </div>
      </div>
    </div>

    <div class="mb-2 d-flex justify-content-between align-items-center">
      <strong>Total to Pay: {{ totalToPay }}</strong>
      <button class="btn btn-success" :disabled="!selectedToPay.length" @click="markAsPaid">
        Pay Selected ({{ selectedToPay.length }})
      </button>
    </div>

    <!-- Table -->
    <table class="table table-bordered">
      <thead>
      <tr>
        <th>Select</th>
        <th>Date</th>
        <th>Plantation</th>
        <th>Worker</th>
        <th>Daily Rate</th>
        <th>Payment</th>
        <th>Paid</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(shift, index) in workerShifts" :key="shift.id">
        <td>
          <input
              type="checkbox"
              v-if="!shift.paid"
              :value="shift.id"
              v-model="selectedToPay"
          />
        </td>
        <td>{{ shift.date }}</td>
        <td>{{ shift.plantationName }}</td>
        <td>{{ shift.workerName }}</td>
        <td>{{ shift.dailyRate }}</td>
        <td>
          <input
              v-if="editIndex === index"
              type="number"
              v-model="editableShift.payment"
              class="form-control"
          />
          <span v-else>{{ shift.payment }}</span>
        </td>
        <td>
          <input
              v-if="editIndex === index"
              type="checkbox"
              v-model="editableShift.paid"
          />
          <span v-else>{{ shift.paid ? 'Yes' : 'No' }}</span>
        </td>
        <td>
          <button
              class="btn btn-sm btn-warning me-1"
              v-if="editIndex !== index"
              @click="startEdit(index)"
          >
            Edit
          </button>
          <div v-else>
            <button class="btn btn-sm btn-success me-1" @click="saveEdit(shift.id, index)">
              Save
            </button>
            <button class="btn btn-sm btn-secondary" @click="cancelEdit">Cancel</button>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'WorkerShiftList',
  data() {
    return {
      filters: {
        workerId: null,
        plantationId: null,
        dateFrom: '',
        dateTo: '',
        paid: null,
      },
      workerShifts: [],
      totalToPay: 0,
      selectedToPay: [],
      workers: [],
      plantations: [],
      editIndex: null,
      editableShift: {
        payment: 0,
        paid: false,
      },
    };
  },
  created() {
    this.fetchWorkers();
    this.fetchPlantations();
    this.fetchShifts();
  },
  methods: {
    async fetchShifts() {
      const payload = {
        ...this.filters,
        paid: this.filters.paid !== null ? this.filters.paid : undefined,
      };
      try {
        const res = await api.post('/worker_shift/list', payload);
        this.workerShifts = res.data.workerShifts;
        this.totalToPay = res.data.totalToPay;
      } catch (e) {
        console.error(e);
      }
    },
    async fetchWorkers() {
      const res = await api.post('/worker/list', { ids: [] });
      this.workers = res.data.workers;
    },
    async fetchPlantations() {
      const res = await api.post('/plantation/list', { ids: [] });
      this.plantations = res.data.plantations;
    },
    startEdit(index) {
      this.editIndex = index;
      this.editableShift = { ...this.workerShifts[index] };
    },
    cancelEdit() {
      this.editIndex = null;
    },
    async saveEdit(id, index) {
      try {
        await api.post('/worker_shift/edit', {
          workerShiftId: id,
          payment: parseFloat(this.editableShift.payment),
          paid: this.editableShift.paid,
        });
        this.workerShifts[index] = { ...this.editableShift };
        this.fetchShifts();
        this.editIndex = null;
      } catch (e) {
        console.error(e);
      }
    },
    async markAsPaid() {
      try {
        await api.post('/worker_shift/set_paid', {
          workerShiftIds: this.selectedToPay,
        });
        this.selectedToPay = [];
        this.fetchShifts();
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style scoped>
input[type="checkbox"] {
  width: 18px;
  height: 18px;
}
</style>
