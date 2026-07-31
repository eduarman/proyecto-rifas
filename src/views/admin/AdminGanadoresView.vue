<script setup>
import { ref, onMounted } from 'vue'
import { winners, addWinner, updateWinner, removeWinner, loadWinners } from '../../data/winners.js'
import { useAdminAction } from '../../composables/useAdminAction.js'

const { errorMsg, run } = useAdminAction()

onMounted(() => {
  loadWinners()
})

function emptyWinnerForm() {
  return { name: '', prize: '', rifaTitle: '', city: '', date: '', comment: '' }
}

function initialsOf(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
}

const winnerForm = ref(emptyWinnerForm())
const editingWinnerId = ref(null)
const winnerMsg = ref('')

async function handleWinnerSubmit() {
  await run(async () => {
    const data = {
      name: winnerForm.value.name,
      prize: winnerForm.value.prize,
      rifaTitle: winnerForm.value.rifaTitle,
      city: winnerForm.value.city,
      date: winnerForm.value.date,
      initials: initialsOf(winnerForm.value.name),
      comment: winnerForm.value.comment,
    }
    if (editingWinnerId.value) {
      await updateWinner(editingWinnerId.value, data)
      winnerMsg.value = `"${data.name}" se actualizó correctamente.`
      editingWinnerId.value = null
    } else {
      await addWinner(data)
      winnerMsg.value = `"${data.name}" se agregó como ganador.`
    }
    winnerForm.value = emptyWinnerForm()
    setTimeout(() => {
      winnerMsg.value = ''
    }, 4000)
  })
}

function editWinner(w) {
  editingWinnerId.value = w.id
  winnerForm.value = {
    name: w.name,
    prize: w.prize,
    rifaTitle: w.rifaTitle,
    city: w.city || '',
    date: w.date,
    comment: w.comment || '',
  }
}

function cancelWinnerEdit() {
  editingWinnerId.value = null
  winnerForm.value = emptyWinnerForm()
}
</script>

<template>
  <div>
    <p class="page-sub">Registra y edita a los ganadores de cada rifa.</p>
    <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

    <div class="grid">
      <form class="card form-card" @submit.prevent="handleWinnerSubmit">
        <h2 class="card-heading">{{ editingWinnerId ? 'Editar ganador' : 'Nuevo ganador' }}</h2>

        <label class="field-label">Nombre</label>
        <input v-model="winnerForm.name" required class="input" placeholder="Ej: Luis Fernández" />

        <label class="field-label">Premio ganado</label>
        <input v-model="winnerForm.prize" required class="input" placeholder="Ej: iPhone 15 Pro Max" />

        <div class="field-row">
          <div>
            <label class="field-label">Rifa</label>
            <input v-model="winnerForm.rifaTitle" required class="input" placeholder="Ej: Rifa Tech" />
          </div>
          <div>
            <label class="field-label">Ciudad (opcional)</label>
            <input v-model="winnerForm.city" class="input" placeholder="Ej: Maracaibo" />
          </div>
        </div>

        <label class="field-label">Fecha de entrega</label>
        <input v-model="winnerForm.date" required class="input" placeholder="Ej: 2 de agosto" />

        <label class="field-label">Comentario (opcional)</label>
        <textarea
          v-model="winnerForm.comment"
          class="input textarea"
          placeholder="Testimonio del ganador. Si lo completas, aparece en Testimonios del home."
        />

        <p v-if="winnerMsg" class="success-msg">{{ winnerMsg }}</p>

        <div class="form-actions">
          <button type="submit" class="submit">
            {{ editingWinnerId ? 'Actualizar ganador' : 'Agregar ganador' }}
          </button>
          <button v-if="editingWinnerId" type="button" class="cancel-edit" @click="cancelWinnerEdit">
            Cancelar edición
          </button>
        </div>
      </form>

      <div class="card list-card">
        <h2 class="card-heading">Ganadores registrados ({{ winners.length }})</h2>
        <p v-if="winners.length === 0" class="empty-note">Aún no hay ganadores registrados.</p>
        <div class="rifa-list">
          <div v-for="w in winners" :key="w.id" class="rifa-row">
            <div class="mini-badge winner-badge">{{ w.initials }}</div>
            <div class="row-main">
              <div class="row-title">{{ w.name }}</div>
              <div class="row-desc">
                {{ w.prize }} · {{ w.rifaTitle }}<span v-if="w.city"> · {{ w.city }}</span> · {{ w.date }}
              </div>
              <div v-if="w.comment" class="row-desc wrap winner-comment">“{{ w.comment }}”</div>
            </div>
            <div class="row-actions">
              <button class="row-toggle" @click="editWinner(w)">Editar</button>
              <button class="row-delete" @click="run(() => removeWinner(w.id))">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.winner-comment {
  font-style: italic;
  margin-top: 4px;
}
</style>
