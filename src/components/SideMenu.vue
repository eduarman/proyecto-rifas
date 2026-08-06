<script setup>
import { computed } from 'vue'
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
  <div class="overlay" @click="toggleMenu">
    <!-- stop propagation so taps inside the drawer don't close it -->
    <div class="drawer" @click.stop>
      <div class="close-row">
        <svg width="22" height="22" viewBox="0 0 24 24" @click="toggleMenu">
          <path d="M6 6l12 12M18 6L6 18" stroke="#0f172a" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <a href="#" class="item" @click.prevent="goRifas">Rifas</a>
      <a href="#como-funciona" class="item" @click.prevent="goSection('como-funciona')">Cómo funciona</a>
      <a href="#testimonios" class="item" @click.prevent="goSection('testimonios')">Ganadores</a>
      <a href="#preguntas" class="item" @click.prevent="goSection('preguntas')">Preguntas</a>
      <template v-if="customerSession">
        <span class="item">Hola, {{ displayName }}</span>
        <a href="#" class="item" @click.prevent="goOrders">Mis compras</a>
        <a href="#" class="item last" @click.prevent="handleSignOut">Salir</a>
      </template>
      <a v-else href="#" class="item last" @click.prevent="goLogin()">Ingresar</a>
      <button class="cta" @click="goRifas">Participar</button>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 20;
}
.drawer {
  background: #fff;
  padding: 20px;
  position: absolute;
  top: 0;
  right: 0;
  width: 260px;
  height: 100%;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
}
.close-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
.close-row svg {
  cursor: pointer;
}
.item {
  padding: 14px 6px;
  color: var(--ink);
  font-size: 16.5px;
  font-weight: 700;
  border-bottom: 1px solid #f1f5f9;
}
.item.last {
  border-bottom: none;
}
.cta {
  margin-top: 14px;
  background: var(--brand);
  color: #fff;
  border: none;
  padding: 13px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

/* the burger that opens this drawer is hidden at desktop widths; this is a defensive fallback */
@media (min-width: 1024px) {
  .overlay {
    display: none;
  }
}
</style>
