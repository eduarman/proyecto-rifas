<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import { logoutAdmin } from '../composables/useAuth.js'
import '../styles/admin.css'

const route = useRoute()
const router = useRouter()

const navItems = [
  { to: '/admin/rifas', label: 'Rifas' },
  { to: '/admin/ganadores', label: 'Ganadores' },
  { to: '/admin/agenda', label: 'Agenda' },
  { to: '/admin/pagos', label: 'Pagos' },
  { to: '/admin/ventas', label: 'Ventas' },
]

const sidebarOpen = ref(false)

// Close the mobile drawer whenever navigation actually happens.
watch(() => route.path, () => {
  sidebarOpen.value = false
})

async function handleLogout() {
  await logoutAdmin()
  router.push('/')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-head">
        <BrandLogo :size="26" :label="15" />
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/rifas" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
            <path d="M13 6v2M13 11v2M13 16v2" />
          </svg>
          Rifas
        </router-link>
        <router-link to="/admin/ganadores" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
            <path d="M7 5H4a3 3 0 0 0 3 5M17 5h3a3 3 0 0 1-3 5" />
            <path d="M12 13v3M9 20h6M10 20v-2h4v2" />
          </svg>
          Ganadores
        </router-link>
        <router-link to="/admin/agenda" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
          Agenda
        </router-link>
        <router-link to="/admin/pagos" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M3 10h18M6 14h4" />
          </svg>
          Pagos
        </router-link>
        <router-link to="/admin/ventas" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20V10M12 20V4M20 20v-7" />
          </svg>
          Ventas
        </router-link>
      </nav>

      <div class="sidebar-foot">
        <router-link to="/" class="nav-item ghost">Ver sitio</router-link>
        <button class="nav-item ghost" @click="handleLogout">Cerrar sesión</button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />

    <div class="admin-main">
      <header class="admin-topbar">
        <button class="burger" aria-label="Abrir menú" @click="sidebarOpen = true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <h1 class="topbar-title">{{ navItems.find((i) => route.path.startsWith(i.to))?.label || 'Panel de administrador' }}</h1>
      </header>

      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: var(--panel);
  /* The off-canvas sidebar below is shifted out of view with translateX,
     but transformed elements still count toward scrollable overflow —
     without this the page gains horizontal scroll on mobile. */
  overflow-x: hidden;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  background: #fff;
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  box-sizing: border-box;
  z-index: 30;
  transform: translateX(-100%);
  transition: transform 0.2s ease;
}
.sidebar.open {
  transform: translateX(0);
}
.sidebar-head {
  padding: 4px 10px 20px;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.sidebar-foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  color: var(--slate-700);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: none;
  border: none;
  font-family: inherit;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  transition: background 0.15s ease, color 0.15s ease;
}
.nav-item:hover {
  background: var(--panel);
  color: var(--ink);
}
.nav-item.router-link-active {
  background: var(--tint);
  color: var(--brand);
}
.nav-item.router-link-active .nav-icon {
  color: var(--brand);
}
.nav-icon {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
}
.nav-item.ghost {
  color: var(--slate-500);
  font-size: 13.5px;
}
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 20;
}
.admin-main {
  min-height: 100vh;
}
.admin-topbar {
  background: #fff;
  border-bottom: 1px solid var(--line);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
}
.burger {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
}
.topbar-title {
  font-size: 17px;
  font-weight: 800;
  margin: 0;
}
.admin-content {
  padding: 24px 18px 60px;
  max-width: 1180px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .sidebar {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: none;
  }
  .burger {
    display: none;
  }
  .admin-main {
    margin-left: 250px;
  }
  .admin-topbar {
    padding: 18px 56px;
  }
  .topbar-title {
    font-size: 20px;
  }
  .admin-content {
    padding: 40px 56px 80px;
  }
}
</style>
