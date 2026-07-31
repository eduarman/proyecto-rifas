<script setup>
import { computed, onMounted, reactive } from 'vue'
import { rifas, loadRifas } from '../../data/content.js'
import { orders, loadOrders } from '../../data/orders.js'

onMounted(() => {
  loadRifas()
  loadOrders()
})

const expanded = reactive({})
function toggleExpanded(id) {
  expanded[id] = !expanded[id]
}

// "Vendido" = números con pedido pendiente o verificado. Los rechazados no
// cuentan: esos números vuelven a quedar disponibles.
const rows = computed(() =>
  rifas.map((r) => {
    const rifaOrders = orders.filter((o) => o.rifaId === r.id)
    const aprobados = rifaOrders
      .filter((o) => o.status === 'verificado')
      .reduce((sum, o) => sum + o.qty, 0)
    const pendientes = rifaOrders
      .filter((o) => o.status === 'pendiente')
      .reduce((sum, o) => sum + o.qty, 0)
    const vendidos = aprobados + pendientes
    const disponible = r.available || 0
    const pct = disponible > 0 ? Math.min(100, Math.round((vendidos / disponible) * 100)) : 0
    const ingresos = rifaOrders
      .filter((o) => o.status === 'verificado')
      .reduce((sum, o) => sum + Number(o.total || 0), 0)

    return {
      id: r.id,
      title: r.title,
      active: r.active,
      disponible,
      aprobados,
      pendientes,
      vendidos,
      restantes: Math.max(0, disponible - vendidos),
      pct,
      ingresos,
      // Most recent first, matches loadOrders()'s order — rejected orders
      // stay in the list so the admin can see why a number freed up.
      orders: rifaOrders,
    }
  }),
)

const totales = computed(() =>
  rows.value.reduce(
    (acc, r) => ({
      vendidos: acc.vendidos + r.vendidos,
      disponible: acc.disponible + r.disponible,
      ingresos: acc.ingresos + r.ingresos,
    }),
    { vendidos: 0, disponible: 0, ingresos: 0 },
  ),
)
</script>

<template>
  <div>
    <p class="page-sub">Números vendidos por rifa y porcentaje sobre el total disponible.</p>

    <div class="summary-row">
      <div class="card summary-card">
        <div class="summary-label">Números vendidos</div>
        <div class="summary-value">{{ totales.vendidos }} / {{ totales.disponible }}</div>
      </div>
      <div class="card summary-card">
        <div class="summary-label">Recaudado (aprobado)</div>
        <div class="summary-value">${{ totales.ingresos.toFixed(2) }}</div>
      </div>
    </div>

    <div class="card">
      <h2 class="card-heading">Ventas por rifa</h2>
      <p v-if="rows.length === 0" class="empty-note">Aún no hay rifas creadas.</p>

      <div class="sales-list">
        <div v-for="r in rows" :key="r.id" class="sales-row" :class="{ 'sales-row-inactive': !r.active }">
          <div class="sales-head">
            <div class="sales-title">
              {{ r.title }}
              <span v-if="!r.active" class="row-tag row-tag-off">Dada de baja</span>
            </div>
            <div class="sales-pct">{{ r.pct }}%</div>
          </div>

          <div class="sales-bar">
            <div class="sales-bar-fill" :style="{ width: r.pct + '%' }" />
          </div>

          <div class="sales-stats">
            <div><span class="stat-num">{{ r.vendidos }}</span> vendidos de {{ r.disponible }}</div>
            <div><span class="stat-num">{{ r.aprobados }}</span> aprobados</div>
            <div><span class="stat-num">{{ r.pendientes }}</span> pendientes</div>
            <div><span class="stat-num">{{ r.restantes }}</span> restantes</div>
          </div>

          <button class="sales-toggle" @click="toggleExpanded(r.id)">
            {{ expanded[r.id] ? 'Ocultar compradores' : 'Ver compradores' }} ({{ r.orders.length }})
          </button>

          <div v-if="expanded[r.id]" class="sales-orders">
            <p v-if="r.orders.length === 0" class="empty-note">Todavía no hay pedidos para esta rifa.</p>
            <div v-for="o in r.orders" :key="o.id" class="sales-order-row">
              <div class="sales-order-main">
                <div class="sales-order-name">{{ o.buyerName }}</div>
                <div class="sales-order-meta">{{ o.qty }} número(s) · {{ o.paymentMethod }} · {{ o.buyerContact }}</div>
              </div>
              <span class="status-chip" :class="'status-' + o.status">{{ o.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}
.summary-card {
  padding: 18px 20px;
}
.summary-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--slate-500);
  margin-bottom: 6px;
}
.summary-value {
  font-size: 22px;
  font-weight: 800;
}

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.sales-row {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 16px;
}
.sales-row-inactive {
  opacity: 0.6;
  background: var(--panel);
}
.sales-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.sales-title {
  font-size: 14.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sales-pct {
  font-size: 14px;
  font-weight: 800;
  color: var(--brand);
  flex-shrink: 0;
}
.sales-bar {
  height: 8px;
  border-radius: 99px;
  background: #eef1f6;
  overflow: hidden;
  margin-bottom: 12px;
}
.sales-bar-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 99px;
}
.sales-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  font-size: 12.5px;
  color: var(--slate-500);
}
.stat-num {
  font-weight: 700;
  color: var(--ink);
}

.sales-toggle {
  margin-top: 12px;
  background: none;
  border: none;
  font-family: inherit;
  color: var(--brand);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.sales-toggle:hover {
  color: var(--brand-dark);
}
.sales-orders {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line-soft);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sales-order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12.5px;
}
.sales-order-name {
  font-weight: 700;
}
.sales-order-meta {
  color: var(--slate-500);
  font-size: 12px;
}

@media (min-width: 640px) {
  .summary-row {
    grid-template-columns: repeat(2, minmax(0, 220px));
  }
}
</style>
