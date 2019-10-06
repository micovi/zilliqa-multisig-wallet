import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import Welcome from './views/Welcome.vue'
import Create from './views/Create.vue'
import Import from './views/Login.vue'
import WalletList from './views/WalletList.vue'
import Wallet from './views/Wallet.vue'
import Dashboard from './views/Dashboard.vue'
import NewTransaction from './views/NewTransaction.vue'
import AddFounds from './views/AddFounds.vue'
import InfoPage from './views/InfoPage.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: Welcome
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/create-wallet',
      name: 'create-wallet',
      component: Create
    },
    {
      path: '/import-wallet',
      name: 'import-wallet',
      component: Import
    },
    {
      path: '/wallets',
      name: 'wallet-list',
      component: WalletList
    },
    {
      path: '/wallet/:address',
      name: 'wallet',
      component: Wallet
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/new-transaction',
      name: 'new-transaction',
      component: NewTransaction
    },
    {
      path: '/add-founds',
      name: 'add-founds',
      component: AddFounds
    },
    {
      path: '/info-page',
      name: 'info-page',
      component: InfoPage
    },
    /* {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('./views/About.vue') // webpackChunkName: "about"
    } */
  ]
})
