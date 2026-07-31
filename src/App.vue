<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import SideMenu from './components/SideMenu.vue'
import { useNav } from './composables/useNav.js'

const route = useRoute()
const { menuOpen } = useNav()
// Login, Checkout and Admin are full-screen states without the public app chrome.
const isBareLayout = computed(() =>
  route.name === 'login' || route.name === 'checkout' || route.path.startsWith('/admin'),
)
</script>

<template>
  <RouterView v-if="isBareLayout" />

  <div v-else class="page">
    <SideMenu v-if="menuOpen" />
    <div class="frame">
      <AppHeader />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.page {
  font-family: Helvetica, Arial, sans-serif;
  color: var(--ink);
  min-height: 100vh;
  background: #fff;
  width: 100%;
  position: relative;
}
/* Below the desktop breakpoint the app reads as a centered mobile card;
   at 1024px+ it opens up to the full-width desktop layout. */
.frame {
  max-width: 480px;
  margin: 0 auto;
  background: #fff;
}

@media (min-width: 1024px) {
  .frame {
    max-width: 100%;
  }
}
</style>
