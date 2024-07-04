import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import { Select, Upload, Button } from "ant-design-vue";
// import 'ant-design-vue/dist/antd.css'

createApp(App).use(store).use(Select).mount('#app')
