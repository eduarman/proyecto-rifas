import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { customerSession } from './useCustomerAuth.js'

// Mobile drawer state is shared app-wide, so a module-level ref is enough —
// no need for a full store now that the router owns the current view.
const menuOpen = ref(false)

export function useNav() {
  const router = useRouter()

  function toggleMenu() {
    menuOpen.value = !menuOpen.value
  }

  function goHome() {
    menuOpen.value = false
    router.push({ name: 'home' })
  }

  function goRifas() {
    menuOpen.value = false
    router.push({ name: 'rifas' })
  }

  function goLogin(query) {
    menuOpen.value = false
    router.push({ name: 'login', query })
  }

  function goRegister(query) {
    menuOpen.value = false
    router.push({ name: 'register', query })
  }

  function goOrders() {
    menuOpen.value = false
    if (customerSession.value) {
      router.push({ name: 'orders' })
    } else {
      router.push({ name: 'login', query: { next: '/mis-compras' } })
    }
  }

  function goAdmin() {
    menuOpen.value = false
    router.push({ name: 'admin' })
  }

  // Requires a real customer session before checkout: logged in goes
  // straight to payment; logged out goes through login/registro first,
  // carrying `next` forward to land back on the payment screen after.
  function goCheckout(rifaId, numbers) {
    menuOpen.value = false
    const next = `/pago/${rifaId}?numbers=${numbers.join(',')}`
    if (customerSession.value) {
      router.push(next)
    } else {
      router.push({ name: 'login', query: { next } })
    }
  }

  function selectRifa(id) {
    menuOpen.value = false
    router.push({ name: 'detail', params: { id } })
  }

  // Navigate home and land on an anchored section (router scrollBehavior does the scrolling).
  function goSection(id) {
    menuOpen.value = false
    router.push({ name: 'home', hash: '#' + id })
  }

  return { menuOpen, toggleMenu, goHome, goRifas, goLogin, goRegister, goOrders, goAdmin, goCheckout, selectRifa, goSection }
}
