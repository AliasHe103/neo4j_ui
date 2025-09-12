import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persistedState from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(persistedState)

app.use(pinia)
app.use(ElementPlus, { locale } )

app.mount('#app')
