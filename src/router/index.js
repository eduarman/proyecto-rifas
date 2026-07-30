import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RifasView from '../views/RifasView.vue'
import DetailView from '../views/DetailView.vue'
import LoginView from '../views/LoginView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import AdminView from '../views/AdminView.vue'
import { isAdmin, authReady } from '../composables/useAuth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/rifas', name: 'rifas', component: RifasView },
    { path: '/rifas/:id', name: 'detail', component: DetailView, props: true },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/pago/:id', name: 'checkout', component: CheckoutView, props: true },
    { path: '/admin', name: 'admin', component: AdminView, meta: { requiresAdmin: true } },
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

// Real Supabase session check. The actual enforcement is server-side (RLS
// policies keyed off is_admin()) — this guard just keeps the UI from
// flashing admin-only screens before redirecting.
router.beforeEach(async (to) => {
  if (to.meta.requiresAdmin) {
    await authReady
    if (!isAdmin.value) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }
})

export default router
