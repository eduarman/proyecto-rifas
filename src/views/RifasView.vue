<script setup>
import { computed, onMounted, ref } from 'vue'
import { rifas, loadRifas } from '../data/content.js'
import { useNav } from '../composables/useNav.js'
import AppFooter from '../components/AppFooter.vue'

const { selectRifa } = useNav()

// content.js only fetches rifas once, at module load — a tab left open
// since before an admin created/toggled a rifa would otherwise keep
// showing the stale list. Refetch every time this page is visited.
onMounted(() => {
  loadRifas()
})

// Rifas deactivated from the admin panel stay out of the public listing.
const activeRifas = computed(() => rifas.filter((r) => r.active))

// Show a first page of cards and let "Ver todas las rifas" reveal the rest,
// instead of dumping the whole (potentially long) list on first paint.
const PAGE_SIZE = 6
const visibleCount = ref(PAGE_SIZE)
const visibleRifas = computed(() => activeRifas.value.slice(0, visibleCount.value))
function showAll() {
  visibleCount.value = activeRifas.value.length
}
</script>

<template>
  <div class="wrap">
    <h1 class="title">Elige tu próximo premio</h1>
    <p class="sub">Sorteos activos verificados. Desde $2 USD.</p>

    <div class="list">
      <div v-for="r in visibleRifas" :key="r.id" class="card">
        <div class="thumb">
          <img v-if="r.imageUrl" :src="r.imageUrl" class="thumb-img" :alt="r.title" />
          <span v-else class="thumb-label">{{ r.imageLabel }}</span>
          <div class="badge" :style="{ background: r.badgeBg, color: r.badgeColor }">{{ r.badge }}</div>
        </div>
        <div class="body">
          <h3 class="card-title">{{ r.title }}</h3>
          <p class="card-desc">{{ r.desc }}</p>
          <div class="meta">
            <span>{{ r.sold }}% vendido</span>
            <span class="muted">
              <span class="avail-mobile">{{ r.available }} disp.</span>
              <span class="avail-desktop">{{ r.available }} disponibles</span>
            </span>
          </div>
          <div class="bar">
            <div class="bar-fill" :style="{ width: r.sold + '%' }" />
          </div>
          <div class="foot">
            <div class="price">
              <div class="date">
                <svg class="date-icon" width="13" height="13" viewBox="0 0 24 24"><path d="M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" stroke="#64748b" stroke-width="1.6" fill="none" /></svg>
                {{ r.date }}
              </div>
              <div class="amount">${{ r.price }} / número</div>
            </div>
            <button class="participate" @click="selectRifa(r.id)">Participar</button>
          </div>
        </div>
      </div>
    </div>

    <button v-if="visibleCount < activeRifas.length" class="see-all" @click="showAll">
      Ver todas las rifas →
    </button>
  </div>

  <AppFooter />
</template>

<style scoped>
.wrap {
  padding: 26px 18px 60px;
}
.title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 8px;
  text-align: center;
}
.sub {
  font-size: 14px;
  color: var(--slate-500);
  margin: 0 0 24px;
  text-align: center;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.card {
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}
.thumb {
  position: relative;
  height: 160px;
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
  font-size: 11px;
  color: var(--slate-400);
  background: rgba(255, 255, 255, 0.85);
  padding: 5px 9px;
  border-radius: 6px;
}
.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
}
.body {
  padding: 16px;
}
.card-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 4px;
}
.card-desc {
  font-size: 13px;
  color: var(--slate-500);
  margin: 0 0 14px;
}
.meta {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 6px;
}
.muted {
  color: var(--slate-500);
  font-weight: 500;
}
.bar {
  height: 6px;
  border-radius: 99px;
  background: #eef1f6;
  margin-bottom: 14px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 99px;
}
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  font-size: 13px;
}
.date {
  color: var(--slate-500);
  display: flex;
  align-items: center;
  gap: 5px;
}
.date-icon {
  display: none;
}
.avail-desktop {
  display: none;
}
.amount {
  font-weight: 700;
}
.participate {
  background: var(--brand);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 9px;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
}
.see-all {
  margin-top: 24px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--input-line);
  padding: 13px;
  border-radius: 11px;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
}

@media (min-width: 1024px) {
  .wrap {
    padding: 56px 56px 80px;
  }
  .title {
    font-size: 38px;
    margin: 0 0 12px;
  }
  .sub {
    font-size: 16.5px;
    margin: 0 0 44px;
  }
  .list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 26px;
    max-width: 1180px;
    margin: 0 auto;
  }
  .card {
    border-radius: 18px;
  }
  .thumb {
    height: 200px;
  }
  .body {
    padding: 20px;
  }
  .card-title {
    font-size: 19px;
  }
  .card-desc {
    font-size: 14px;
    margin: 0 0 16px;
  }
  .meta {
    font-size: 13px;
  }
  .bar {
    height: 7px;
    margin-bottom: 16px;
  }
  .price {
    font-size: 13.5px;
    color: var(--slate-700);
  }
  .date-icon {
    display: inline-block;
  }
  .avail-mobile {
    display: none;
  }
  .avail-desktop {
    display: inline;
  }
  .amount {
    color: var(--ink);
  }
  .participate {
    padding: 11px 18px;
    border-radius: 10px;
    font-size: 14px;
  }
  .participate:hover {
    background: var(--brand-dark);
  }
  .see-all {
    width: auto;
    margin: 40px auto 0;
    padding: 13px 24px;
    display: block;
  }
  .see-all:hover {
    background: #f8fafc;
  }
}
</style>
