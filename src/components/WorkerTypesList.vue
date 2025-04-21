<template>
  <div class="container mt-4">
    <h2>WorkTypes</h2>

    <!-- Add WorkType Form -->
    <form @submit.prevent="createWorkType" class="mb-4">
      <div class="row g-2 align-items-center">
        <div class="col-auto">
          <label for="newWorkTypeName" class="col-form-label">New WorkType:</label>
        </div>
        <div class="col">
          <input
              id="newWorkTypeName"
              v-model="newWorkType.name"
              type="text"
              class="form-control"
              placeholder="Enter workType name"
              required
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
    <!-- WorkType Table -->
    <table class="table table-bordered">
      <thead>
      <tr>
        <th>Name</th>
        <th style="width: 160px">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(workType, index) in workTypes" :key="workType.id">
        <td v-if="editingIndex === index">
          <input
              v-model="editForm.name"
              type="text"
              class="form-control"
              required
          />
        </td>
        <td v-else>{{ workType.name }}</td>

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
  name: 'WorkTypeList',
  data() {
    return {
      workTypes: [],
      newWorkType: {
        name: '',
      },
      editForm: { id: null, name: '' },
      editingIndex: null,
      error: null,
      successMessage: null,
      messageTimeout: null,
    };
  },
  async created() {
    await this.fetchWorkTypes();
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
    async fetchWorkTypes() {
      try {
        const response = await api.post('/work_type/list', {});
        this.workTypes = response.data.workTypes || [];
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to fetch workTypes.');
      }
    },
    async createWorkType() {
      try {
        const response = await api.post('/work_type/add', this.newWorkType);
        this.workTypes.push({id: response.data, ... this.newWorkType}); // adjust if API doesn't return the new workType
        this.newWorkType.name = '';
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to create workType.');
      }
    },
    editRow(index) {
      this.editingIndex = index;
      this.editForm = { ...this.workTypes[index] };
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editForm = { id: null, name: '' };
    },
    async saveEdit(index) {
      try {
        await api.post('/work_type/edit', this.editForm);
        this.workTypes[index] = { ...this.editForm };
        this.cancelEdit();
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to update workType.');
      }
    },
  },
};
</script>
