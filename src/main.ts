import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './theme/tokens.css'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')
