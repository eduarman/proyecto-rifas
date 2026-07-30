<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { rifas } from '../data/content.js'
import { useNav } from '../composables/useNav.js'

const route = useRoute()
const { goRifas, goLogin } = useNav()

const qty = ref(1)
// Deactivated rifas are excluded entirely, same as from the public listing —
// falls back to the first active rifa rather than a 404 for a bad/stale id.
const selectedRifa = computed(
  () =>
    rifas.find((r) => r.id === route.params.id && r.active) ||
    rifas.find((r) => r.active),
)
const total = computed(() => qty.value * (selectedRifa.value?.price ?? 0))

// Reset the quantity whenever the visited rifa changes.
watch(
  () => route.params.id,
  () => {
    qty.value = 1
  },
)

function incQty() {
  qty.value += 1
}
function decQty() {
  qty.value = Math.max(1, qty.value - 1)
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

          <!-- shown in-flow on mobile only; desktop uses the sidebar's own control -->
          <div class="qty-mobile">
            <label class="qty-label">Cantidad de números</label>
            <div class="qty">
              <button class="qty-btn" @click="decQty">−</button>
              <span class="qty-val">{{ qty }}</span>
              <button class="qty-btn" @click="incQty">+</button>
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

          <label class="qty-label">Cantidad de números</label>
          <div class="qty">
            <button class="qty-btn" @click="decQty">−</button>
            <span class="qty-val">{{ qty }}</span>
            <button class="qty-btn" @click="incQty">+</button>
          </div>

          <div class="total-row">
            <span class="total-label-desktop">Total</span>
            <span class="total-amount-desktop">${{ total }}</span>
          </div>

          <button class="buy" @click="goLogin">Comprar números</button>
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
      <button class="buy" @click="goLogin">Comprar números</button>
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
.qty {
  display: flex;
  align-items: center;
  gap: 16px;
}
.qty-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid var(--input-line);
  background: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}
.qty-val {
  font-size: 20px;
  font-weight: 800;
  width: 26px;
  text-align: center;
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
  .qty-mobile {
    display: none;
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
  .purchase-card .qty {
    margin-bottom: 22px;
  }
  .purchase-card .qty-btn {
    width: 40px;
    height: 40px;
  }
  .purchase-card .qty-btn:hover {
    background: #f8fafc;
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
