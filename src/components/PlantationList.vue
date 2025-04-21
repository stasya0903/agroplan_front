<template>
  <div class="container mt-4">
    <h2>Plantations</h2>

    <!-- Add Plantation Form -->
    <form @submit.prevent="createPlantation" class="mb-4">
      <div class="row g-2 align-items-center">
        <div class="col-auto">
          <label for="newPlantationName" class="col-form-label">New Plantation:</label>
        </div>
        <div class="col">
          <input
              id="newPlantationName"
              v-model="newPlantation.name"
              type="text"
              class="form-control"
              placeholder="Enter plantation name"
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
    <!-- Plantation Table -->
    <table class="table table-bordered">
      <thead>
      <tr>
        <th>Name</th>
        <th style="width: 160px">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(plantation, index) in plantations" :key="plantation.id">
        <td v-if="editingIndex === index">
          <input
              v-model="editForm.name"
              type="text"
              class="form-control"
              required
          />
        </td>
        <td v-else>{{ plantation.name }}</td>

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
  name: 'PlantationList',
  data() {
    return {
      plantations: [],
      newPlantation: {
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
    await this.fetchPlantations();
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
    async fetchPlantations() {
      try {
        const response = await api.post('/plantation/list', {});
        this.plantations = response.data.plantations || [];
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to fetch plantations.');
      }
    },
    async createPlantation() {
      try {
        const response = await api.post('/plantation/add', this.newPlantation);
        this.plantations.push({id: response.data, ... this.newPlantation}); // adjust if API doesn't return the new plantation
        this.newPlantation.name = '';
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to create plantation.');
      }
    },
    editRow(index) {
      this.editingIndex = index;
      this.editForm = { ...this.plantations[index] };
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editForm = { id: null, name: '' };
    },
    async saveEdit(index) {
      try {
        await api.post('/plantation/edit', this.editForm);
        this.plantations[index] = { ...this.editForm };
        this.cancelEdit();
      } catch (error) {
        this.setMessage(error.response?.data?.message || 'Failed to update plantation.');
      }
    },
  },
};
</script>
