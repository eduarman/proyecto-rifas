import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RifasView from '../views/RifasView.vue'
import DetailView from '../views/DetailView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrdersView from '../views/OrdersView.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import AdminRifasView from '../views/admin/AdminRifasView.vue'
import AdminGanadoresView from '../views/admin/AdminGanadoresView.vue'
import AdminAgendaView from '../views/admin/AdminAgendaView.vue'
import AdminPagosView from '../views/admin/AdminPagosView.vue'
import AdminVentasView from '../views/admin/AdminVentasView.vue'
import { isAdmin, authReady } from '../composables/useAuth.js'
import { customerSession, customerAuthReady } from '../composables/useCustomerAuth.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/rifas', name: 'rifas', component: RifasView },
    { path: '/rifas/:id', name: 'detail', component: DetailView, props: true },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/recuperar-contrasena', name: 'forgot-password', component: ForgotPasswordView },
    { path: '/registro', name: 'register', component: RegisterView },
    { path: '/pago/:id', name: 'checkout', component: CheckoutView, props: true, meta: { requiresCustomer: true } },
    { path: '/mis-compras', name: 'orders', component: OrdersView, meta: { requiresCustomer: true } },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      redirect: '/admin/rifas',
      children: [
        { path: 'rifas', name: 'admin-rifas', component: AdminRifasView },
        { path: 'ganadores', name: 'admin-ganadores', component: AdminGanadoresView },
        { path: 'agenda', name: 'admin-agenda', component: AdminAgendaView },
        { path: 'pagos', name: 'admin-pagos', component: AdminPagosView },
        { path: 'ventas', name: 'admin-ventas', component: AdminVentasView },
      ],
    },
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
  if (to.meta.requiresCustomer) {
    await customerAuthReady
    if (!customerSession.value) {
      return { path: '/login', query: { next: to.fullPath } }
    }
  }
})

export default router
