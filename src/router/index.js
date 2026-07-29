import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RifasView from '../views/RifasView.vue'
import DetailView from '../views/DetailView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/rifas', name: 'rifas', component: RifasView },
    { path: '/rifas/:id', name: 'detail', component: DetailView, props: true },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
