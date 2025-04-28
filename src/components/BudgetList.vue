<template>
  <div class="container">
    <!-- Filters -->
    <div class="card my-3">
      <div class="card-header">Filters</div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="plantationId" class="form-label">Plantation</label>
            <select v-model="filters.plantationId" class="form-select">
              <option v-for="p in plantationOptions" :key="p.value" :value="p.value">
                {{ p.text }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Date From</label>
            <input type="date" v-model="filters.dateFrom" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Date To</label>
            <input type="date" v-model="filters.dateTo" class="form-control" />
          </div>
          <div class="col-12 mt-2">
            <button class="btn btn-primary" @click="fetchBudget">Get Budget</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="card my-3">
      <div class="card-body d-flex justify-content-between">
        <div><strong>Total Income:</strong> ${{ totalIncome.toFixed(2) }}</div>
        <div><strong>Total Spend:</strong> ${{ totalSpend.toFixed(2) }}</div>
        <div><strong>Profit:</strong> ${{ profit.toFixed(2) }}</div>
      </div>
    </div>

    <!-- Chart -->
    <div class="card my-3">
      <div class="card-body">
        <canvas id="budgetChart"></canvas>
      </div>
    </div>

    <!-- Incoming List -->
    <div class="card my-3">
      <div class="card-header">Incoming</div>
      <div class="card-body table-responsive">
        <table class="table table-bordered">
          <thead>
          <tr>
            <th>ID</th>
            <th>Plantation</th>
            <th>Date</th>
            <th>Buyer</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Date Paid</th>
            <th>Note</th>

          </tr>
          </thead>
          <tbody>
          <tr v-for="inc in budget.incoming" :key="inc.incomingId">
            <td>{{ inc.incomingId }}</td>
            <td>{{ inc.plantationName }}</td>
            <td>{{ formatDate(inc.date) }}</td>
            <td>{{ inc.buyerName }}</td>
            <td>{{ inc.weight }}</td>
            <td>{{ inc.price }}</td>
            <td>{{ inc.amount }}</td>
            <td>{{inc.paid ? "YES" : "NO"}}</td>
            <td>{{inc.datePaid}}</td>
            <td>{{ inc.note }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Spending List -->
    <div class="card my-3">
      <div class="card-header">Spending</div>
      <div class="card-body table-responsive">
        <table class="table table-bordered">
          <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Plantation</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Note</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="sp in budget.spending" :key="sp.id">
            <td>{{ sp.id }}</td>
            <td>{{ formatDate(sp.date) }}</td>
            <td>{{ sp.plantationName }}</td>
            <td>{{ sp.spendingTypeName }}</td>
            <td>{{ sp.amount }}</td>
            <td>{{ sp.note || '' }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import api from "@/services/api";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the components you need
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default {
  data() {
    return {
      filters: {
        plantationId: null,
        dateFrom: null,
        dateTo: null,
      },
      plantationOptions: [],
      budget: {
        incoming: [],
        spending: [],
      },
      totalSpend: 0,
      totalIncome: 0,
      profit: 0,
      chart: null,
    };
  },
  mounted() {
    this.loadPlantations();
  },
  methods: {
    async loadPlantations() {
      const res = await api.post("/plantation/list", { ids: [] });
      this.plantationOptions = res.data.plantations.map(p => ({
        value: p.id,
        text: p.name,
      }));
    },
    async fetchBudget() {
      try {
        const res = await api.post("/budget/get", this.filters);
        this.budget = res.data;
        this.totalSpend = res.data.totalSpend;
        this.totalIncome = res.data.totalIncome;
        this.profit = res.data.profit;

      } catch (err) {
        console.log(err)
        alert("Failed to fetch budget data");
      }
      this.renderChart();
    },
    renderChart() {
      if (this.chart) this.chart.destroy();
      const ctx = document.getElementById("budgetChart").getContext("2d");
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Income", "Spending"],
          datasets: [{
            label: "Budget Overview",
            backgroundColor: ["#198754", "#dc3545"],
            data: [this.totalIncome, this.totalSpend],
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    formatDate(datetime) {
      if (!datetime) return '';
      const date = new Date(datetime);
      return new Intl.DateTimeFormat('ru').format(date);
    },
  }
};
</script>
