import { ref } from 'vue'
import { useRouter } from 'vue-router'

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

  function goLogin() {
    menuOpen.value = false
    router.push({ name: 'login' })
  }

  function goAdmin() {
    menuOpen.value = false
    router.push({ name: 'admin' })
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

  return { menuOpen, toggleMenu, goHome, goRifas, goLogin, goAdmin, selectRifa, goSection }
}
