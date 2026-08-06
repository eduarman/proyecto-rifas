<script setup>
import { computed } from 'vue'
import BrandLogo from './BrandLogo.vue'
import { useNav } from '../composables/useNav.js'
import { customerSession, signOut } from '../composables/useCustomerAuth.js'

const { goHome, goRifas, goLogin, goOrders, goSection, toggleMenu } = useNav()

async function handleSignOut() {
  await signOut()
  goHome()
}

const displayName = computed(() => {
  const user = customerSession.value?.user
  return user?.user_metadata?.full_name?.split(' ')[0] || user?.email
})
</script>

<template>
  <header class="header">
    <div class="logo-hit" @click="goHome">
      <BrandLogo :size="30" :label="17" class="logo-mobile" />
      <BrandLogo :size="36" :label="20" class="logo-desktop" />
    </div>

    <!-- desktop inline nav -->
    <nav class="nav-desktop">
      <a href="#" @click.prevent="goRifas">Rifas</a>
      <a href="#como-funciona" @click.prevent="goSection('como-funciona')">Cómo funciona</a>
      <a href="#testimonios" @click.prevent="goSection('testimonios')">Ganadores</a>
      <a href="#preguntas" @click.prevent="goSection('preguntas')">Preguntas</a>
    </nav>
    <div class="actions-desktop">
      <template v-if="customerSession">
        <span class="user-name">Hola, {{ displayName }}</span>
        <a href="#" class="login-link" @click.prevent="goOrders">Mis compras</a>
        <a href="#" class="login-link" @click.prevent="handleSignOut">Salir</a>
      </template>
      <a v-else href="#" class="login-link" @click.prevent="goLogin()">Ingresar</a>
      <button class="cta" @click="goRifas">Participar</button>
    </div>

    <!-- mobile hamburger -->
    <div class="burger" @click="toggleMenu" aria-label="Abrir menú">
      <svg width="22" height="22" viewBox="0 0 24 24">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line-soft);
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}
.logo-hit {
  cursor: pointer;
}
.logo-desktop {
  display: none;
}
.burger {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.nav-desktop,
.actions-desktop {
  display: none;
}

@media (min-width: 1024px) {
  .header {
    padding: 18px 56px;
  }
  .logo-mobile {
    display: none;
  }
  .logo-desktop {
    display: flex;
  }
  .burger {
    display: none;
  }
  .nav-desktop {
    display: flex;
    gap: 34px;
  }
  .nav-desktop a {
    color: var(--slate-700);
    font-weight: 500;
    font-size: 15px;
  }
  .nav-desktop a:hover {
    color: var(--ink);
  }
  .actions-desktop {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .login-link {
    color: var(--ink);
    font-weight: 600;
    font-size: 15px;
  }
  .user-name {
    color: var(--slate-700);
    font-size: 14px;
    font-weight: 600;
  }
  .cta {
    background: var(--brand);
    color: #fff;
    border: none;
    padding: 11px 22px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
  }
  .cta:hover {
    background: var(--brand-dark);
  }
}
</style>
