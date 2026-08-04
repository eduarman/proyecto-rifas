<script setup>
import { ref, onMounted } from 'vue'
import { fetchMyOrders } from '../data/orders.js'
import { useNav } from '../composables/useNav.js'

const { goRifas } = useNav()

const orders = ref([])
const loading = ref(true)
const error = ref('')

const statusLabel = {
  pendiente: 'Pendiente de validación',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  try {
    orders.value = await fetchMyOrders()
  } catch (e) {
    error.value = e?.message || 'No se pudo cargar tu historial.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="wrap">
    <h1 class="title">Mis compras</h1>

    <p v-if="error" class="error-msg">{{ error }}</p>

    <p v-else-if="loading" class="empty">Cargando…</p>

    <div v-else-if="orders.length === 0" class="empty-card">
      <p class="empty">Todavía no tienes compras.</p>
      <button class="participate" @click="goRifas">Ver rifas</button>
    </div>

    <div v-else class="list">
      <div v-for="order in orders" :key="order.id" class="card">
        <div class="card-top">
          <span class="rifa-title">{{ order.rifaTitle }}</span>
          <span class="status" :class="order.status">{{ statusLabel[order.status] || order.status }}</span>
        </div>
        <div class="row">
          <span>{{ order.qty }} {{ order.qty === 1 ? 'número' : 'números' }} · {{ order.paymentMethod }}</span>
          <span class="total">${{ order.total }}</span>
        </div>
        <div class="date">{{ formatDate(order.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding: 26px 18px 60px;
  max-width: 640px;
  margin: 0 auto;
  box-sizing: border-box;
}
.title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 20px;
}
.empty {
  color: var(--slate-500);
  font-size: 14px;
}
.empty-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 32px 20px;
  text-align: center;
}
.empty-card .empty {
  margin: 0 0 16px;
}
.participate {
  background: var(--brand);
  color: #fff;
  border: none;
  padding: 11px 22px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}
.error-msg {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card {
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 16px 18px;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.rifa-title {
  font-weight: 700;
  font-size: 15px;
}
.status {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.status.pendiente {
  background: #fff7ed;
  color: #b45309;
}
.status.aprobado {
  background: #f0fdf4;
  color: #16a34a;
}
.status.rechazado {
  background: #fef2f2;
  color: #b91c1c;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 13.5px;
  color: var(--slate-500);
}
.total {
  font-weight: 700;
  color: var(--ink);
  font-size: 15px;
}
.date {
  margin-top: 6px;
  font-size: 12px;
  color: var(--slate-400);
}

@media (min-width: 1024px) {
  .wrap {
    padding: 48px 24px 80px;
  }
}
</style>
