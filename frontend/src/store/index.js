import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import alert from './alert'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        auth,
        alert
    }
})

export default store;