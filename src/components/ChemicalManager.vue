<template>
  <div class="container mt-4">
    <h3>Gestión de Químicos</h3>

    <!-- Messages -->
    <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Add Chemical Form -->
    <!-- Add Chemical Form -->
    <!-- Add Chemical Inline Inputs -->
    <div class="card p-3 mb-4">
      <h5 class="mb-3">Agregar nuevo químico</h5>
      <div class="row">
        <div class="col-12 col-md-4 mb-2">
          <input
              v-model="newChemical.commercialName"
              type="text"
              class="form-control"
              placeholder="Nombre comercial"
              required
          />
        </div>
        <div class="col-12 col-md-4 mb-2">
          <input
              v-model="newChemical.activeIngredient"
              type="text"
              class="form-control"
              placeholder="Ingrediente activo"
              required
          />
        </div>
        <div class="col-12 col-md-4 mb-2">
          <button @click="addChemical" class="btn btn-primary w-100">
            Agregar
          </button>
        </div>
      </div>
    </div>



    <!-- Table of Chemicals -->
    <div class="table-responsive">
      <table class="table table-bordered table-hover">
        <thead class="thead-light">
        <tr>
          <th>Nombre comercial</th>
          <th>Ingrediente activo</th>
          <th style="width: 160px;">Acciones</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="chemical in chemicals" :key="chemical.id">
          <td>
            <div v-if="editId === chemical.id">
              <input
                  v-model="editChemical.commercialName"
                  type="text"
                  class="form-control"
              />
            </div>
            <div v-else>{{ chemical.commercialName }}</div>
          </td>
          <td>
            <div v-if="editId === chemical.id">
              <input
                  v-model="editChemical.activeIngredient"
                  type="text"
                  class="form-control"
              />
            </div>
            <div v-else>{{ chemical.activeIngredient }}</div>
          </td>
          <td>
            <div v-if="editId === chemical.id">
              <button class="btn btn-success btn-sm mr-2" @click="saveEdit(chemical.id)">
                Guardar
              </button>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit">
                Cancelar
              </button>
            </div>
            <div v-else>
              <button class="btn btn-warning btn-sm mr-2" @click="startEdit(chemical)">
                Editar
              </button>
              <button class="btn btn-danger btn-sm" @click="deleteChemical(chemical.id)">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'ChemicalManager',
  data() {
    return {
      newChemical: {
        commercialName: '',
        activeIngredient: ''
      },
      chemicals: [],
      editId: null,
      editChemical: {
        commercialName: '',
        activeIngredient: ''
      },
      successMessage: null,
      error: null,
      messageTimeout: null
    };
  },
  methods: {
    async fetchChemicals() {
      try {
        const response = await api.post('/chemical/list');
        this.chemicals = response.data.chemicals;
      } catch (e) {
        this.setMessage('Error al cargar los químicos');
      }
    },
    async addChemical() {
      try {
        await api.post('/chemical/add', this.newChemical);
        this.setMessage('Químico agregado correctamente', 'success');
        this.newChemical.commercialName = '';
        this.newChemical.activeIngredient = '';
        this.fetchChemicals();
      } catch (e) {
        this.setMessage('Error al agregar químico');
      }
    },
    async deleteChemical(id) {
      try {
        await api.delete('/chemical/delete', { data: { id } });
        this.setMessage('Químico eliminado', 'success');
        this.fetchChemicals();
      } catch (e) {
        this.setMessage('Error al eliminar químico');
      }
    },
    startEdit(chemical) {
      this.editId = chemical.id;
      this.editChemical = {
        commercialName: chemical.commercialName,
        activeIngredient: chemical.activeIngredient
      };
    },
    cancelEdit() {
      this.editId = null;
      this.editChemical = {
        commercialName: '',
        activeIngredient: ''
      };
    },
    async saveEdit(id) {
      try {
        await api.post('/chemical/edit', {
          id,
          commercialName: this.editChemical.commercialName,
          activeIngredient: this.editChemical.activeIngredient
        });
        this.setMessage('Cambios guardados correctamente', 'success');
        this.editId = null;
        this.fetchChemicals();
      } catch (e) {
        this.setMessage('Error al guardar cambios');
      }
    },
    setMessage(text, type = 'error') {
      if (this.messageTimeout) clearTimeout(this.messageTimeout);
      if (type === 'success') this.successMessage = text;
      if (type === 'error') this.error = text;
      this.messageTimeout = setTimeout(() => {
        this.successMessage = null;
        this.error = null;
      }, 20000);
    }
  },
  mounted() {
    this.fetchChemicals();
  }
};
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
