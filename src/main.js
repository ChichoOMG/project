
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import './assets/main.css'

import App from './App.vue';
import router from './router';

const app = createApp(App); 
const pinia = createPinia();

app.use(router); 
app.use(pinia);  
app.use(ElementPlus);
app.mount('#app');

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('Service Worker registrado:', reg))
        .catch((err) => console.log('Error en SW:', err));
    });
  }
  