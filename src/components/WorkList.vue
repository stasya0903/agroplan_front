<template>
  <div class="container mt-4">
    <h3 class="mb-3">Add Work</h3>
    <form @submit.prevent="addWork" class="row g-3 border p-3 rounded mb-5 bg-light">
      <div class="col-md-3">
        <label class="form-label">Work Type</label>
        <select v-model="newWork.workTypeId" class="form-select" required>
          <option v-for="type in workTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Plantation</label>
        <select v-model="newWork.plantationId" class="form-select" required>
          <option v-for="p in plantations" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Date</label>
        <input type="datetime-local" v-model="newWork.date" class="form-control" required />
      </div>
      <div class="col-md-3">
        <label class="form-label">Workers</label>
        <select v-model="newWork.workerIds" multiple class="form-select">
          <option v-for="w in workers" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>
      </div>
      <div class="col-md-12">
        <label class="form-label">Note</label>
        <input type="text" v-model="newWork.note" class="form-control" />
      </div>
      <div class="col-12">
        <button class="btn btn-success w-100">Add Work</button>
      </div>
    </form>

    <h3 class="mb-3">Work List</h3>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <!-- Filter Section -->
    <form @submit.prevent="fetchWorks" class="border p-3 mb-3 bg-light rounded">
      <div class="row">
        <div class="col-md-3">
          <label class="form-label">Work Type</label>
          <select class="form-control" v-model="filters.workTypeId">
            <option :value="null">All</option>
            <option v-for="type in workTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Plantation</label>
          <select class="form-control" v-model="filters.plantationId">
            <option :value="null">All</option>
            <option v-for="plant in plantations" :key="plant.id" :value="plant.id">{{ plant.name }}</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Date From</label>
          <input type="date" class="form-control" v-model="filters.dateFrom" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Date To</label>
          <input type="date" class="form-control" v-model="filters.dateTo" />
        </div>
      </div>
      <div class="mt-3">
        <button class="btn btn-secondary me-2" type="submit">Filter</button>
        <button class="btn btn-outline-secondary" @click="resetFilters">Clear</button>
      </div>
    </form>
    <table class="table table-hover table-bordered">
      <thead class="table-light">
      <tr>
        <th>Date</th>
        <th>Work Type</th>
        <th>Plantation</th>
        <th>Workers</th>
        <th>Note</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="work in works" :key="work.id">
        <td v-if="editId !== work.id">{{ work.date }}</td>
        <td v-else><input v-model="editForm.date" type="datetime-local" class="form-control" /></td>

        <td v-if="editId !== work.id">{{ work.workTypeName }}</td>
        <td v-else>
          <select v-model="editForm.workTypeId" class="form-select">
            <option v-for="type in workTypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </td>

        <td v-if="editId !== work.id">{{ work.plantationName }}</td>
        <td v-else>
          <select v-model="editForm.plantationId" class="form-select">
            <option v-for="p in plantations" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </td>

        <td v-if="editId !== work.id">
          <ul class="mb-0">
            <li v-for="w in work.workersInfo" :key="w.id">{{ w.name }}</li>
          </ul>
        </td>
        <td v-else>
          <select v-model="editForm.workerIds" multiple class="form-select">
            <option v-for="w in workers" :value="w.id" :key="w.id">{{ w.name }}</option>
          </select>
        </td>

        <td v-if="editId !== work.id">{{ work.note }}</td>
        <td v-else><input v-model="editForm.note" type="text" class="form-control" /></td>

        <td>
          <button v-if="editId !== work.id" class="btn btn-primary btn-sm" @click="startEdit(work)">Edit</button>
          <div v-else class="d-flex gap-1">
            <button class="btn btn-success btn-sm" @click="saveEdit(work.id)">Save</button>
            <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancel</button>
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
  data() {
    return {
      newWork: {
        workTypeId: null,
        plantationId: null,
        date: '',
        workerIds: [],
        note: '',
      },
      works: [],
      workers: [],
      plantations: [],
      workTypes: [],
      editId: null,
      editForm: {},
      error: null,
      filters: {
        workTypeId: null,
        plantationId: null,
        dateFrom: null,
        dateTo: null
      },
    };
  },
  async created() {
    await this.fetchData();
    await this.fetchWorks();
  },
  methods: {
    async fetchData() {
      try {
        const [workerRes, plantationRes, typeRes] = await Promise.all([
          api.post('/worker/list', { ids: [] }),
          api.post('/plantation/list', { ids: [] }),
          api.post('/work_type/list', { ids: [] }),
        ]);
        this.workers = workerRes.data.workers;
        this.plantations = plantationRes.data.plantations;
        this.workTypes = typeRes.data.workTypes;
      } catch (err) {
        this.error = 'Failed to load data.';
      }
    },
    async fetchWorks() {
      try {
        const res = await api.post('/work/list', this.filters);
        this.works = res.data;
      } catch (err) {
        this.error = 'Failed to load works.';
      }
    },
    resetFilters() {
      this.filters = { workTypeId: null, plantationId: null, dateFrom: null, dateTo: null };
      this.fetchWorks();
    },
    async addWork() {
      try {
        const date = this.formatDateTime(this.newWork.date);
        await api.post('/work/add', {...this.newWork, date});
        await this.fetchWorks();
        this.newWork = {
          workTypeId: null,
          plantationId: null,
          date: '',
          workerIds: [],
          note: '',
        };
      } catch (error) {
        console.log(error);
        this.error = error.response?.data?.message || 'Failed to add work.';
      }
    },
    startEdit(work) {
      this.editId = work.id;
      this.editForm = {
        workId: work.id,
        workTypeId: work.workTypeId,
        plantationId: work.plantationId,
        date: work.date,
        workerIds: work.workersInfo.map(w => w.id),
        note: work.note,
      };
    },
    cancelEdit() {
      this.editId = null;
      this.editForm = {};
    },
    async saveEdit() {
      try {
        const date = this.formatDateTime(this.newWork.date);
        await api.post('/work/edit', {...this.editForm, date});
        this.editId = null;
        await this.fetchWorks();
      } catch (err) {
        this.error = 'Failed to save changes.';
      }
    },
    formatDateTime(value) {
      if (!value) return null
      const date = new Date(value)
      return date.toISOString().slice(0, 19).replace('T', ' ')
    }
  },
};
</script>

<style scoped>
ul {
  padding-left: 16px;
  margin: 0;
}
</style>
