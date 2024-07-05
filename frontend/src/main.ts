import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

import { Select, Upload, Button } from "ant-design-vue";
// import 'ant-design-vue/dist/antd.css'

app.use(pinia).use(Select)

app.mount('#app')
