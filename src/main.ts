import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";

const app = createApp(App);
app.use(PrimeVue);
app.use(store);
app.use(ToastService);

app.mount('#app');
