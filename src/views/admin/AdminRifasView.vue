<script setup>
import { ref, onMounted } from 'vue'
import { rifas, addRifa, removeRifa, toggleRifaActive, loadRifas } from '../../data/content.js'
import { useAdminAction } from '../../composables/useAdminAction.js'

const { errorMsg, run } = useAdminAction()

onMounted(() => {
  loadRifas()
})

const badgePresets = {
  Nueva: { bg: '#eef2ff', color: '#4338ca' },
  '🔥 Más popular': { bg: '#fee2e2', color: '#dc2626' },
  'Cierra pronto': { bg: '#fff7ed', color: '#b45309' },
}

function emptyForm() {
  return {
    title: '',
    desc: '',
    longDesc: '',
    price: null,
    date: '',
    sold: 0,
    available: null,
    imageLabel: '',
    badge: 'Nueva',
  }
}

const form = ref(emptyForm())
const successMsg = ref('')

async function handleSubmit() {
  await run(async () => {
    const preset = badgePresets[form.value.badge]
    const nueva = await addRifa({
      title: form.value.title,
      desc: form.value.desc,
      longDesc: form.value.longDesc,
      price: Number(form.value.price),
      date: form.value.date,
      sold: Number(form.value.sold) || 0,
      available: Number(form.value.available),
      imageLabel: form.value.imageLabel || `foto: ${form.value.title}`,
      badge: form.value.badge,
      badgeBg: preset.bg,
      badgeColor: preset.color,
    })
    successMsg.value = `"${nueva.title}" se creó correctamente.`
    form.value = emptyForm()
    setTimeout(() => {
      successMsg.value = ''
    }, 4000)
  })
}
</script>

<template>
  <div>
    <p class="page-sub">Crea nuevas rifas y gestiona las que ya están publicadas.</p>
    <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

    <div class="grid">
      <form class="card form-card" @submit.prevent="handleSubmit">
        <h2 class="card-heading">Nueva rifa</h2>

        <label class="field-label">Título</label>
        <input v-model="form.title" required class="input" placeholder="Ej: Rifa Moto 0km" />

        <label class="field-label">Descripción corta</label>
        <input v-model="form.desc" required class="input" placeholder="Ej: Moto 0km + casco" />

        <label class="field-label">Descripción completa</label>
        <textarea
          v-model="form.longDesc"
          required
          class="input textarea"
          placeholder="Detalle del premio que se muestra en la página de la rifa."
        />

        <div class="field-row">
          <div>
            <label class="field-label">Precio por número (USD)</label>
            <input v-model="form.price" required type="number" min="0.01" step="0.01" class="input" />
          </div>
          <div>
            <label class="field-label">Números disponibles</label>
            <input v-model="form.available" required type="number" min="1" step="1" class="input" />
          </div>
        </div>

        <div class="field-row">
          <div>
            <label class="field-label">Fecha del sorteo</label>
            <input v-model="form.date" required class="input" placeholder="Ej: 20 de septiembre" />
          </div>
          <div>
            <label class="field-label">% vendido inicial</label>
            <input v-model="form.sold" type="number" min="0" max="100" step="1" class="input" />
          </div>
        </div>

        <label class="field-label">Etiqueta de imagen (placeholder)</label>
        <input v-model="form.imageLabel" class="input" placeholder="Ej: foto: moto deportiva roja" />

        <label class="field-label">Etiqueta destacada</label>
        <select v-model="form.badge" class="input">
          <option v-for="(_, key) in badgePresets" :key="key" :value="key">{{ key }}</option>
        </select>

        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

        <button type="submit" class="submit">Crear rifa</button>
      </form>

      <div class="card list-card">
        <h2 class="card-heading">Rifas publicadas ({{ rifas.length }})</h2>
        <div class="rifa-list">
          <div v-for="r in rifas" :key="r.id" class="rifa-row" :class="{ 'row-inactive': !r.active }">
            <div class="mini-badge" :style="{ background: r.badgeBg, color: r.badgeColor }">{{ r.badge }}</div>
            <div class="row-main">
              <div class="row-title">
                {{ r.title }}
                <span v-if="!r.custom" class="row-tag">Prototipo</span>
                <span v-if="!r.active" class="row-tag row-tag-off">Dada de baja</span>
              </div>
              <div class="row-desc">{{ r.desc }} · ${{ r.price }}/número · {{ r.date }}</div>
            </div>
            <div class="row-actions">
              <button class="row-toggle" @click="run(() => toggleRifaActive(r.id))">
                {{ r.active ? 'Dar de baja' : 'Reactivar' }}
              </button>
              <button v-if="r.custom" class="row-delete" @click="run(() => removeRifa(r.id))">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
