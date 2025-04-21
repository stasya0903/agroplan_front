<template>
  <div id="app">
    <!-- Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <router-link class="navbar-brand" to="/budget">
          <img src="@/assets/logo.png" alt="AgroPlan Logo" style="height: 40px;"/> <!-- Adjust the height as needed -->
          AgroPlan
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/plantations">Plantations</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/workers">Workers</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/work-types">Work Types</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/works">Works</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/worker-shifts">Worker Shifts</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/spending">Spending</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/incoming">Incoming</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/budget">Budget Page</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div class="container mt-4">
      <router-view></router-view> <!-- Render components based on routes -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
#app {
  font-family: 'Arial', sans-serif;
}

.navbar {
  margin-bottom: 20px;
}
</style>
