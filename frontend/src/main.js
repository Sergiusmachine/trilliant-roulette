import { createApp } from 'https://cdn.jsdelivr.net/npm/vue@next/dist/vue.esm-browser.js'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App);
app.use(router)
app.use(store)
app.mount('#app')
