<template>
  <div class="container mt-4">
    <h2>Workers</h2>

    <!-- Add Worker Form -->
    <form @submit.prevent="createWorker" class="mb-4">
      <div class="row g-2 align-items-center">
        <div class="col-auto">
          <label for="newWorkerName" class="col-form-label">New Worker:</label>
        </div>
        <div class="col">
          <input
              id="newWorkerName"
              v-model="newWorker.name"
              type="text"
              class="form-control"
              placeholder="Enter worker name"
              required
          />
        </div>
        <div class="col">
          <input type="number"
                 v-model="newWorker.dailyRate"
                 class="form-control"
                 step="0.01"
                 placeholder="Enter daily rate"
          />
        </div>
        <div class="col-auto">
          <button type="submit" class="btn btn-success">Create</button>
        </div>
      </div>
    </form>
    <div v-if="successMessage" class="alert alert-success mt-3">
      {{ successMessage }}
    </div>
    <div v-if="error" class="alert alert-danger mt-3">
      {{ error }}
    </div>
    <!-- Worker Table -->
    <table class="table table-bordered">
      <thead>
      <tr>
        <th>Name</th>
        <th>Daily rate</th>
        <th style="width: 160px">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(worker, index) in workers" :key="worker.id">
        <td v-if="editingIndex === index">
          <input
              v-model="editForm.name"
              type="text"
              class="form-control"
              required
          />
        </td>
        <td v-else>{{ worker.name }}</td>
        <td v-if="editingIndex === index">
          <input
              v-model="editForm.dailyRate"
              type="text"
              class="form-control"
              required
          />
        </td>
        <td v-else>{{ worker.dailyRate }}</td>

        <td>
          <div v-if="editingIndex === index">
            <button @click="saveEdit(index)" class="btn btn-success btn-sm">Save</button>
            <button @click="cancelEdit" class="btn btn-secondary btn-sm ms-2">Cancel</button>
          </div>
          <div v-else>
            <button @click="editRow(index)" class="btn btn-primary btn-sm">Edit</button>
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
  name: 'WorkerList',
  data() {
    return {
      workers: [],
      newWorker: {
        name: '',
        dailyRate: null
      },
      editForm: { id: null, name: '', dailyRate: null },
      editingIndex: null,
      error: null,
      successMessage: null,
      messageTimeout: null,
    };
  },
  async created() {
    await this.fetchWorkers();
  },
  methods: {
    setMessage( text, type ='error') {
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      if (type === 'success') this.successMessage = text;
      if (type === 'error') this.error = text;
      this.messageTimeout = setTimeout(() => {
        this.successMessage = null;
        this.error = null;
      }, 20000); // 20 seconds
    },
    async fetchWorkers() {
      try {
        const response = await api.post('/worker/list', {});
        this.workers = response.data.workers || [];
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to fetch workers.');
      }
    },
    async createWorker() {
      try {
        const response = await api.post('/worker/add', {...this.newWorker, dailyRate: parseFloat(this.newWorker.dailyRate) });
        this.workers.push({id: response.data, ...this.newWorker});
        this.newWorker.name = '';
        this.newWorker.dailyRate = null;
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to create worker.');
      }
    },
    editRow(index) {
      this.editingIndex = index;
      this.editForm = { ...this.workers[index] };
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editForm = { id: null, name: '', dailyRate: null };
    },
    async saveEdit(index) {
      try {
        await api.post('/worker/edit', {...this.editForm, dailyRate: parseFloat(this.editForm.dailyRate)});
        this.workers[index] = { ...this.editForm };
        this.cancelEdit();
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to update worker.');
      }
    },
  },
};
</script>
