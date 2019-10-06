import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

import general from './modules/general'

Vue.use(Vuex)

const vuexPersist = new VuexPersist({
  key: 'multisig',
  storage: window.localStorage
})

export default new Vuex.Store({
  modules: {
    general
  },
  plugins: [vuexPersist.plugin]
})
