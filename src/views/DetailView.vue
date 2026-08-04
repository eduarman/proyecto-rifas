<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { rifas, loadRifas } from '../data/content.js'
import { fetchTakenNumbers } from '../data/orders.js'
import { useNav } from '../composables/useNav.js'

const route = useRoute()
const { goRifas, goCheckout } = useNav()

// content.js only fetches rifas once, at module load — refetch here so a
// tab open since before this rifa was created/edited picks up the change.
onMounted(() => {
  loadRifas()
})

// Deactivated rifas are excluded entirely, same as from the public listing —
// falls back to the first active rifa rather than a 404 for a bad/stale id.
const selectedRifa = computed(
  () =>
    rifas.find((r) => r.id === route.params.id && r.active) ||
    rifas.find((r) => r.active),
)

const selectedNumbers = ref([])
const takenNumbers = ref([])
const loadingNumbers = ref(false)
const numbersError = ref('')

const totalNumbers = computed(() => selectedRifa.value?.available || 0)
const numberWidth = computed(() => String(totalNumbers.value).length)
const allNumbers = computed(() => Array.from({ length: totalNumbers.value }, (_, i) => i + 1))
const takenSet = computed(() => new Set(takenNumbers.value))

function pad(n) {
  return String(n).padStart(numberWidth.value, '0')
}
function isTaken(n) {
  return takenSet.value.has(n)
}
function isSelected(n) {
  return selectedNumbers.value.includes(n)
}
function toggleNumber(n) {
  if (isTaken(n)) return
  const idx = selectedNumbers.value.indexOf(n)
  if (idx === -1) selectedNumbers.value.push(n)
  else selectedNumbers.value.splice(idx, 1)
}

const total = computed(() => selectedNumbers.value.length * (selectedRifa.value?.price ?? 0))

async function loadTaken(rifaId) {
  selectedNumbers.value = []
  takenNumbers.value = []
  numbersError.value = ''
  if (!rifaId) return
  loadingNumbers.value = true
  try {
    takenNumbers.value = await fetchTakenNumbers(rifaId)
  } catch {
    numbersError.value = 'No se pudo cargar la disponibilidad de números. Recarga la página.'
  } finally {
    loadingNumbers.value = false
  }
}

// Reload availability whenever the visited rifa changes.
watch(
  () => selectedRifa.value?.id,
  (id) => loadTaken(id),
  { immediate: true },
)

function handleBuy() {
  if (selectedNumbers.value.length === 0) return
  goCheckout(
    selectedRifa.value.id,
    [...selectedNumbers.value].sort((a, b) => a - b),
  )
}
</script>

<template>
  <div class="wrap">
    <div class="back-row">
      <div class="back" @click="goRifas">
        <svg width="15" height="15" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
        Volver a rifas
      </div>
    </div>

    <p v-if="!selectedRifa" class="empty-state">No hay rifas disponibles en este momento.</p>

    <div v-else class="grid">
      <div class="left">
        <div class="thumb">
          <span class="thumb-label">{{ selectedRifa.imageLabel }}</span>
          <div class="badge" :style="{ background: selectedRifa.badgeBg, color: selectedRifa.badgeColor }">
            {{ selectedRifa.badge }}
          </div>
        </div>

        <div class="body">
          <h1 class="title">{{ selectedRifa.title }}</h1>
          <p class="desc">{{ selectedRifa.longDesc }}</p>

          <div class="meta">
            <span>{{ selectedRifa.sold }}% vendido</span>
            <span class="muted">{{ selectedRifa.available }} disponibles</span>
          </div>
          <div class="bar">
            <div class="bar-fill" :style="{ width: selectedRifa.sold + '%' }" />
          </div>

          <div class="numbers-section">
            <label class="qty-label">Elige tus números ({{ selectedNumbers.length }} seleccionados)</label>
            <p v-if="numbersError" class="numbers-error">{{ numbersError }}</p>
            <p v-else-if="loadingNumbers" class="numbers-loading">Cargando disponibilidad…</p>
            <div v-else class="numbers-grid" :style="{ '--num-w': (numberWidth * 9 + 16) + 'px' }">
              <button
                v-for="n in allNumbers"
                :key="n"
                type="button"
                class="number-cell"
                :class="{ taken: isTaken(n), selected: isSelected(n) }"
                :disabled="isTaken(n)"
                @click="toggleNumber(n)"
              >
                {{ pad(n) }}
              </button>
            </div>
            <div class="numbers-legend">
              <span><i class="dot dot-free" />Disponible</span>
              <span><i class="dot dot-selected" />Elegido</span>
              <span><i class="dot dot-taken" />Ocupado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- desktop-only sticky purchase card -->
      <div class="right">
        <div class="purchase-card">
          <div class="price-row">
            <span class="price-label">Precio por número</span>
            <span class="price-value">${{ selectedRifa.price }}</span>
          </div>
          <div class="date-row">
            <svg width="13" height="13" viewBox="0 0 24 24"><path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="#94a3b8" stroke-width="1.6" fill="none" /></svg>
            Sorteo el {{ selectedRifa.date }}
          </div>

          <div class="selected-summary">{{ selectedNumbers.length }} número(s) seleccionado(s)</div>

          <div class="total-row">
            <span class="total-label-desktop">Total</span>
            <span class="total-amount-desktop">${{ total }}</span>
          </div>

          <button class="buy" :disabled="selectedNumbers.length === 0" @click="handleBuy">Comprar números</button>
          <div class="secure-note">
            <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-4z" fill="#94a3b8" /></svg>
            Pago 100% seguro y verificado
          </div>
        </div>
      </div>
    </div>

    <!-- mobile-only fixed purchase bar -->
    <div v-if="selectedRifa" class="purchase-mobile">
      <div>
        <div class="total-label">Total</div>
        <div class="total-amount">${{ total }}</div>
      </div>
      <button class="buy" :disabled="selectedNumbers.length === 0" @click="handleBuy">Comprar números</button>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  padding-bottom: 110px;
}
.back-row {
  padding: 18px 18px 0;
}
.empty-state {
  padding: 40px 18px;
  text-align: center;
  color: var(--slate-500);
  font-size: 14px;
}
.back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--slate-500);
  font-size: 13.5px;
  width: fit-content;
  margin-bottom: 14px;
  cursor: pointer;
}
.thumb {
  position: relative;
  height: 220px;
  margin: 0 18px;
  border-radius: 16px;
  background: repeating-linear-gradient(
    135deg,
    #eef1f6 0px,
    #eef1f6 12px,
    #e6eaf1 12px,
    #e6eaf1 24px
  );
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-label {
  font-family: monospace;
  font-size: 11.5px;
  color: var(--slate-400);
  background: rgba(255, 255, 255, 0.85);
  padding: 5px 10px;
  border-radius: 6px;
}
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.body {
  padding: 20px 18px;
}
.title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 10px;
}
.desc {
  font-size: 14px;
  color: var(--slate-500);
  line-height: 1.6;
  margin: 0 0 18px;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.muted {
  color: var(--slate-500);
  font-weight: 500;
}
.bar {
  height: 7px;
  border-radius: 99px;
  background: #eef1f6;
  overflow: hidden;
  margin-bottom: 22px;
}
.bar-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 99px;
}
.qty-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--slate-700);
  display: block;
  margin-bottom: 10px;
}
.numbers-section {
  margin-top: 4px;
}
.numbers-error {
  font-size: 13px;
  color: #dc2626;
}
.numbers-loading {
  font-size: 13px;
  color: var(--slate-500);
}
.numbers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--num-w, 52px), 1fr));
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
  padding: 4px 4px 4px 0;
  margin-bottom: 12px;
}
.number-cell {
  font-family: monospace;
  font-size: 12.5px;
  font-weight: 700;
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid var(--input-line);
  background: #fff;
  color: var(--slate-700);
  cursor: pointer;
  text-align: center;
}
.number-cell:hover:not(:disabled) {
  border-color: var(--brand);
}
.number-cell.selected {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.number-cell.taken {
  background: var(--panel);
  color: var(--slate-400);
  border-color: var(--line-soft);
  cursor: not-allowed;
  text-decoration: line-through;
}
.numbers-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: var(--slate-500);
}
.numbers-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
.dot-free {
  background: #fff;
  border: 1px solid var(--input-line);
}
.dot-selected {
  background: var(--brand);
}
.dot-taken {
  background: var(--slate-400);
}
.selected-summary {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--slate-700);
  margin-bottom: 18px;
}

.right {
  display: none;
}

.purchase-mobile {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
  background: #fff;
  border-top: 1px solid var(--line);
  padding: 14px 18px;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 15;
}
.total-label {
  font-size: 11.5px;
  color: var(--slate-500);
}
.total-amount {
  font-size: 19px;
  font-weight: 800;
  color: var(--brand);
}
.buy {
  flex: 1;
  background: var(--brand);
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 11px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}
.buy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 1024px) {
  .wrap {
    padding: 40px 56px 80px;
    max-width: 1180px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .back-row {
    padding: 0;
  }
  .back {
    font-size: 14.5px;
    margin-bottom: 26px;
  }
  .back:hover {
    color: var(--ink);
  }

  .grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 48px;
  }
  .thumb {
    height: 360px;
    margin: 0 0 24px;
    border-radius: 20px;
  }
  .thumb-label {
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 8px;
  }
  .badge {
    top: 14px;
    left: 14px;
    padding: 6px 14px;
  }
  .body {
    padding: 0;
  }
  .title {
    font-size: 32px;
    margin: 0 0 10px;
  }
  .desc {
    font-size: 15.5px;
    margin: 0 0 22px;
  }
  .meta {
    font-size: 13.5px;
    margin-bottom: 8px;
  }
  .bar {
    height: 8px;
    margin-bottom: 0;
  }
  .numbers-grid {
    max-height: 420px;
  }

  .right {
    display: block;
  }
  .purchase-card {
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 28px;
    height: fit-content;
    position: sticky;
    top: 24px;
  }
  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
  }
  .price-label {
    font-size: 14px;
    color: var(--slate-500);
  }
  .price-value {
    font-size: 22px;
    font-weight: 800;
  }
  .date-row {
    font-size: 13px;
    color: var(--slate-500);
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid var(--line-soft);
    margin-bottom: 20px;
  }
  .total-label-desktop {
    font-size: 15px;
    font-weight: 600;
    color: var(--slate-700);
  }
  .total-amount-desktop {
    font-size: 22px;
    font-weight: 800;
    color: var(--brand);
  }
  .purchase-card .buy {
    width: 100%;
    padding: 14px;
    font-size: 15.5px;
  }
  .purchase-card .buy:hover {
    background: var(--brand-dark);
  }
  .secure-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 14px;
    font-size: 12.5px;
    color: var(--slate-400);
  }

  .purchase-mobile {
    display: none;
  }
  .wrap {
    padding-bottom: 80px;
  }
}
</style>
