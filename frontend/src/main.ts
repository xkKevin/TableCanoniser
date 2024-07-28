import { createApp } from 'vue'
import App from './App.vue'

import { createPinia } from 'pinia'

const pinia = createPinia()
const app = createApp(App)

import { Select, Upload, Button, Tabs, Tooltip, Popover, Input, Modal, Space } from "ant-design-vue";
// import 'ant-design-vue/dist/reset.css';

app.use(pinia).use(Select).use(Tabs).use(Button).use(Upload)
    .use(Tooltip).use(Popover).use(Input).use(Modal).use(Space);

// A Vue component for including inline SVG icons from different popular iconpacks easily.
// https://oh-vue-icons.js.org/docs
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiUpload, BiDownload, LaRocketSolid, BiArrowClockwise } from "oh-vue-icons/icons";

addIcons(BiUpload, BiDownload, LaRocketSolid, BiArrowClockwise);

// app.config.globalProperties.$basePath = process.env.BASE_URL;

app.component("v-icon", OhVueIcon);

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)

app.mount('#app')
