<script setup>
import { computed, onMounted, ref } from 'vue'
import { orders, setOrderStatus, loadOrders, getProofSignedUrl } from '../../data/orders.js'
import { useAdminAction } from '../../composables/useAdminAction.js'

const { errorMsg, run } = useAdminAction()

onMounted(() => {
  loadOrders()
})

const stats = computed(() => ({
  total: orders.length,
  pendientes: orders.filter((o) => o.status === 'pendiente').length,
  verificados: orders.filter((o) => o.status === 'verificado').length,
  rechazados: orders.filter((o) => o.status === 'rechazado').length,
}))

const search = ref('')

// Busca por nombre, cédula, ciudad, contacto o rifa — todo lo que
// identifica a un comprador dentro de un pedido.
const filteredOrders = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return orders
  return orders.filter((o) =>
    [o.buyerName, o.buyerCedula, o.buyerCity, o.buyerContact, o.buyerPhone, o.rifaTitle]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q)),
  )
})

async function viewProof(path) {
  if (!path) return
  const url = await getProofSignedUrl(path)
  if (url) window.open(url, '_blank', 'noopener')
  else {
    errorMsg.value = 'No se pudo abrir el comprobante.'
    setTimeout(() => {
      errorMsg.value = ''
    }, 5000)
  }
}
</script>

<template>
  <div>
    <p class="page-sub">Revisa y aprueba los pagos recibidos por cada rifa.</p>
    <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

    <div class="summary-row">
      <div class="card summary-card">
        <div class="summary-label">Total pagos</div>
        <div class="summary-value">{{ stats.total }}</div>
      </div>
      <div class="card summary-card">
        <div class="summary-label">Pendientes</div>
        <div class="summary-value stat-pendiente">{{ stats.pendientes }}</div>
      </div>
      <div class="card summary-card">
        <div class="summary-label">Verificados</div>
        <div class="summary-value stat-verificado">{{ stats.verificados }}</div>
      </div>
      <div class="card summary-card">
        <div class="summary-label">Rechazados</div>
        <div class="summary-value stat-rechazado">{{ stats.rechazados }}</div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-heading">Pagos recibidos ({{ orders.length }})</h2>

      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Buscar por nombre, cédula, ciudad, contacto o rifa…"
        />
      </div>
      <p v-if="search && orders.length > 0" class="search-meta">
        {{ filteredOrders.length }} de {{ orders.length }} resultado(s)
      </p>

      <p v-if="orders.length === 0" class="empty-note">Aún no se han recibido pagos.</p>
      <p v-else-if="filteredOrders.length === 0" class="empty-note">
        Ningún pago coincide con "{{ search }}".
      </p>
      <div class="rifa-list">
        <div v-for="o in filteredOrders" :key="o.id" class="rifa-row">
          <div class="row-main">
            <div class="row-title">
              {{ o.buyerName }}
              <span class="status-chip" :class="'status-' + o.status">{{ o.status }}</span>
            </div>
            <div class="row-desc wrap">
              {{ o.rifaTitle }} · {{ o.qty }} número(s)<span v-if="o.numbers?.length"> ({{ o.numbers.join(', ') }})</span> ·
              ${{ o.total }} · {{ o.paymentMethod }} · contacto: {{ o.buyerContact }}
              <span v-if="o.buyerCedula"> · CI: {{ o.buyerCedula }}</span>
              <span v-if="o.buyerCity"> · {{ o.buyerCity }}</span>
              <span v-if="o.buyerPhone"> · Tel: {{ o.buyerPhone }}</span>
            </div>
          </div>
          <div class="row-actions">
            <button v-if="o.proofPath" class="row-toggle" @click="viewProof(o.proofPath)">
              Ver comprobante
            </button>
            <template v-if="o.status === 'pendiente'">
              <button class="row-toggle approve" @click="run(() => setOrderStatus(o.id, 'verificado'))">
                Aprobar
              </button>
              <button class="row-delete" @click="run(() => setOrderStatus(o.id, 'rechazado'))">
                Rechazar
              </button>
            </template>
            <button v-else class="row-toggle" @click="run(() => setOrderStatus(o.id, 'pendiente'))">
              Marcar pendiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
