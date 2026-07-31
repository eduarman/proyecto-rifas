<script setup>
import { ref, onMounted } from 'vue'
import { schedule, addScheduleItem, updateScheduleItem, removeScheduleItem, loadSchedule } from '../../data/content.js'
import { useAdminAction } from '../../composables/useAdminAction.js'

const { errorMsg, run } = useAdminAction()

onMounted(() => {
  loadSchedule()
})

const statusOptions = ['Activa', 'Próxima', 'Cerrada']

function emptyScheduleForm() {
  return { title: '', prize: '', mon: '', day: '', time: '', status: 'Activa' }
}

const scheduleForm = ref(emptyScheduleForm())
const editingScheduleId = ref(null)
const scheduleMsg = ref('')

async function handleScheduleSubmit() {
  await run(async () => {
    const data = {
      title: scheduleForm.value.title,
      prize: scheduleForm.value.prize,
      mon: scheduleForm.value.mon.toUpperCase(),
      day: scheduleForm.value.day,
      time: scheduleForm.value.time,
      status: scheduleForm.value.status,
    }
    if (editingScheduleId.value) {
      await updateScheduleItem(editingScheduleId.value, data)
      scheduleMsg.value = `"${data.title}" se actualizó correctamente.`
      editingScheduleId.value = null
    } else {
      await addScheduleItem(data)
      scheduleMsg.value = `"${data.title}" se agregó a la agenda.`
    }
    scheduleForm.value = emptyScheduleForm()
    setTimeout(() => {
      scheduleMsg.value = ''
    }, 4000)
  })
}

function editScheduleItem(e) {
  editingScheduleId.value = e.id
  scheduleForm.value = { title: e.title, prize: e.prize, mon: e.mon, day: e.day, time: e.time, status: e.status }
}

function cancelScheduleEdit() {
  editingScheduleId.value = null
  scheduleForm.value = emptyScheduleForm()
}
</script>

<template>
  <div>
    <p class="page-sub">Programa y edita los próximos sorteos de la agenda.</p>
    <p v-if="errorMsg" class="error-banner">{{ errorMsg }}</p>

    <div class="grid">
      <form class="card form-card" @submit.prevent="handleScheduleSubmit">
        <h2 class="card-heading">{{ editingScheduleId ? 'Editar sorteo' : 'Nuevo sorteo en agenda' }}</h2>

        <label class="field-label">Título</label>
        <input v-model="scheduleForm.title" required class="input" placeholder="Ej: Rifa Moto Épica" />

        <label class="field-label">Premio</label>
        <input v-model="scheduleForm.prize" required class="input" placeholder="Ej: Moto 0km + casco" />

        <div class="field-row">
          <div>
            <label class="field-label">Mes (3 letras)</label>
            <input v-model="scheduleForm.mon" required maxlength="3" class="input" placeholder="Ej: SEP" />
          </div>
          <div>
            <label class="field-label">Día</label>
            <input v-model="scheduleForm.day" required maxlength="2" class="input" placeholder="Ej: 20" />
          </div>
        </div>

        <div class="field-row">
          <div>
            <label class="field-label">Hora del sorteo</label>
            <input v-model="scheduleForm.time" required class="input" placeholder="Ej: 9:00 PM" />
          </div>
          <div>
            <label class="field-label">Estado</label>
            <select v-model="scheduleForm.status" class="input">
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <p v-if="scheduleMsg" class="success-msg">{{ scheduleMsg }}</p>

        <div class="form-actions">
          <button type="submit" class="submit">
            {{ editingScheduleId ? 'Actualizar sorteo' : 'Agregar a la agenda' }}
          </button>
          <button v-if="editingScheduleId" type="button" class="cancel-edit" @click="cancelScheduleEdit">
            Cancelar edición
          </button>
        </div>
      </form>

      <div class="card list-card">
        <h2 class="card-heading">Agenda publicada ({{ schedule.length }})</h2>
        <p v-if="schedule.length === 0" class="empty-note">Aún no hay sorteos en la agenda.</p>
        <div class="rifa-list">
          <div v-for="e in schedule" :key="e.id" class="rifa-row">
            <div class="mini-badge date-badge">
              <span class="date-badge-mon">{{ e.mon }}</span>
              <span class="date-badge-day">{{ e.day }}</span>
            </div>
            <div class="row-main">
              <div class="row-title">{{ e.title }}</div>
              <div class="row-desc">{{ e.prize }} · {{ e.time }} · {{ e.status }}</div>
            </div>
            <div class="row-actions">
              <button class="row-toggle" @click="editScheduleItem(e)">Editar</button>
              <button class="row-delete" @click="run(() => removeScheduleItem(e.id))">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
