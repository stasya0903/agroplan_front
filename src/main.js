import Vue from 'vue';
import App from './App.vue';  // Import the root component
import router from './router'; // Import the Vue Router instance

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Disable production tip
Vue.config.productionTip = false;

// Create a new Vue instance and mount it to the #app element
new Vue({
  render: h => h(App),
  router,  // Include the router
}).$mount('#app');
