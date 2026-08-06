<script setup>
import { ref, reactive, onMounted } from 'vue'
import { rifas, addRifa, updateRifa, removeRifa, toggleRifaActive, loadRifas, uploadRifaImage, updateRifaImage } from '../../data/content.js'
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
const imageFile = ref(null)
const submitting = ref(false)
const editingId = ref(null)

function handleImageFileChange(e) {
  imageFile.value = e.target.files[0] || null
}

function fieldsFromForm() {
  const preset = badgePresets[form.value.badge]
  return {
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
  }
}

function handleEdit(r) {
  editingId.value = r.id
  imageFile.value = null
  form.value = {
    title: r.title,
    desc: r.desc,
    longDesc: r.longDesc,
    price: r.price,
    date: r.date,
    sold: r.sold,
    available: r.available,
    imageLabel: r.imageLabel,
    badge: r.badge in badgePresets ? r.badge : 'Nueva',
  }
  successMsg.value = ''
}

function handleCancelEdit() {
  editingId.value = null
  form.value = emptyForm()
  imageFile.value = null
}

async function handleSubmit() {
  submitting.value = true
  await run(async () => {
    if (editingId.value) {
      const actualizada = await updateRifa(editingId.value, fieldsFromForm())
      successMsg.value = `"${actualizada.title}" se actualizó correctamente.`
      editingId.value = null
      form.value = emptyForm()
    } else {
      const imageUrl = imageFile.value ? await uploadRifaImage(imageFile.value) : null
      const nueva = await addRifa({ ...fieldsFromForm(), imageUrl })
      successMsg.value = `"${nueva.title}" se creó correctamente.`
      form.value = emptyForm()
      imageFile.value = null
    }
    setTimeout(() => {
      successMsg.value = ''
    }, 4000)
  })
  submitting.value = false
}

// Cambiar la imagen de una rifa ya publicada (incluidas las del prototipo,
// que solo tienen el placeholder de texto). Un <input type=file> por fila.
const changingImage = reactive({})

async function handleChangeImage(rifaId, e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  changingImage[rifaId] = true
  await run(async () => {
    const url = await uploadRifaImage(file)
    await updateRifaImage(rifaId, url)
  })
  changingImage[rifaId] = false
}
</script>

<template>
  <div>
    <p class="page-sub">Crea nuevas rifas y gestiona las que ya están publicadas.</p>
    <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

    <div class="grid">
      <form class="card form-card" @submit.prevent="handleSubmit">
        <h2 class="card-heading">{{ editingId ? 'Editar rifa' : 'Nueva rifa' }}</h2>

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
            <label class="field-label">Cantidad de números (ej: 100, 1000)</label>
            <input v-model="form.available" required type="number" min="1" step="1" class="input" placeholder="Ej: 100" />
          </div>
        </div>
        <p class="field-hint">Define el rango de números de la rifa (del 1 al que pongas aquí) y el tamaño de la grilla en Ventas.</p>

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

        <template v-if="!editingId">
          <label class="field-label">Imagen de la rifa</label>
          <input type="file" accept="image/*" class="input" @change="handleImageFileChange" />
          <p class="field-hint">Opcional. Si no subes una imagen, se muestra el placeholder de abajo.</p>
        </template>
        <p v-else class="field-hint">La imagen se cambia desde la lista de la derecha, con "Cambiar imagen".</p>

        <label class="field-label">Etiqueta de imagen (placeholder)</label>
        <input v-model="form.imageLabel" class="input" placeholder="Ej: foto: moto deportiva roja" />

        <label class="field-label">Etiqueta destacada</label>
        <select v-model="form.badge" class="input">
          <option v-for="(_, key) in badgePresets" :key="key" :value="key">{{ key }}</option>
        </select>

        <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

        <div class="form-actions">
          <button type="submit" class="submit" :disabled="submitting">
            {{ submitting ? (editingId ? 'Guardando…' : 'Creando…') : editingId ? 'Guardar cambios' : 'Crear rifa' }}
          </button>
          <button v-if="editingId" type="button" class="cancel-edit" @click="handleCancelEdit">Cancelar edición</button>
        </div>
      </form>

      <div class="card list-card">
        <h2 class="card-heading">Rifas publicadas ({{ rifas.length }})</h2>
        <div class="rifa-list">
          <div v-for="r in rifas" :key="r.id" class="rifa-row" :class="{ 'row-inactive': !r.active }">
            <img v-if="r.imageUrl" :src="r.imageUrl" class="row-thumb" alt="" />
            <div v-else class="mini-badge" :style="{ background: r.badgeBg, color: r.badgeColor }">{{ r.badge }}</div>
            <div class="row-main">
              <div class="row-title">
                {{ r.title }}
                <span v-if="!r.custom" class="row-tag">Prototipo</span>
                <span v-if="!r.active" class="row-tag row-tag-off">Dada de baja</span>
              </div>
              <div class="row-desc">{{ r.desc }} · ${{ r.price }}/número · {{ r.date }}</div>
            </div>
            <div class="row-actions">
              <label class="row-toggle row-image-label">
                {{ changingImage[r.id] ? 'Subiendo…' : r.imageUrl ? 'Cambiar imagen' : 'Agregar imagen' }}
                <input type="file" accept="image/*" hidden :disabled="changingImage[r.id]" @change="handleChangeImage(r.id, $event)" />
              </label>
              <button class="row-toggle" @click="handleEdit(r)">Editar</button>
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
