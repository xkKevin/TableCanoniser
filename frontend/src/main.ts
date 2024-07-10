import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

import { Select, Upload, Button, Tabs, Tooltip } from "ant-design-vue";
// import 'ant-design-vue/dist/antd.css'

app.use(pinia).use(Select).use(Tabs).use(Button).use(Upload).use(Tooltip)

app.mount('#app')
