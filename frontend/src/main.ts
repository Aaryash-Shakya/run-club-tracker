import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { OhVueIcon, addIcons } from 'oh-vue-icons'
import { MdKeyboardarrowleftRound, MdKeyboardarrowrightRound } from 'oh-vue-icons/icons'

addIcons(MdKeyboardarrowleftRound, MdKeyboardarrowrightRound)

const app = createApp(App)

app.component('VIcon', OhVueIcon)
app.use(router)
app.mount('#app')
