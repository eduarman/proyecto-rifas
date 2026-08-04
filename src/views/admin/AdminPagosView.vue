<script setup>
import { onMounted } from 'vue'
import { orders, setOrderStatus, loadOrders, getProofSignedUrl } from '../../data/orders.js'
import { useAdminAction } from '../../composables/useAdminAction.js'

const { errorMsg, run } = useAdminAction()

onMounted(() => {
  loadOrders()
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

    <div class="card">
      <h2 class="card-heading">Pagos recibidos ({{ orders.length }})</h2>
      <p v-if="orders.length === 0" class="empty-note">Aún no se han recibido pagos.</p>
      <div class="rifa-list">
        <div v-for="o in orders" :key="o.id" class="rifa-row">
          <div class="row-main">
            <div class="row-title">
              {{ o.buyerName }}
              <span class="status-chip" :class="'status-' + o.status">{{ o.status }}</span>
            </div>
            <div class="row-desc wrap">
              {{ o.rifaTitle }} · {{ o.qty }} número(s)<span v-if="o.numbers?.length"> ({{ o.numbers.join(', ') }})</span> ·
              ${{ o.total }} · {{ o.paymentMethod }} · contacto: {{ o.buyerContact }}
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
