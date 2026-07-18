import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const isStaging =
  window.location.hostname === 'shop.fsparts.org' || import.meta.env.VITE_APP_ENV === 'staging'

if (isStaging) {
  const meta = document.createElement('meta')
  meta.name = 'robots'
  meta.content = 'noindex, nofollow'
  document.head.appendChild(meta)
}

createApp(App).use(createPinia()).use(router).mount('#app')
