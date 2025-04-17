import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/styles/main.css';
import './assets/styles/variables.css';

// Create and mount the root instance
const app = createApp(App);

// Use plugins
app.use(router);
app.use(store);

// Mount the app
app.mount('#app');
