import Vue from 'vue'

import store from './store'

import App from './App.vue'
import "./tailwind.css"

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  store: store
}).$mount('#app')