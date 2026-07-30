<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import {
  rifas,
  addRifa,
  removeRifa,
  toggleRifaActive,
  schedule,
  addScheduleItem,
  updateScheduleItem,
  removeScheduleItem,
} from '../data/content.js'
import { winners, addWinner, updateWinner, removeWinner } from '../data/winners.js'
import { orders, setOrderStatus } from '../data/orders.js'
import { logoutAdmin } from '../composables/useAuth.js'

const router = useRouter()

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

function handleSubmit() {
  const preset = badgePresets[form.value.badge]
  const nueva = addRifa({
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
}

function handleLogout() {
  logoutAdmin()
  router.push('/')
}

function emptyWinnerForm() {
  return { name: '', prize: '', rifaTitle: '', city: '', date: '' }
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

function handleWinnerSubmit() {
  const data = {
    name: winnerForm.value.name,
    prize: winnerForm.value.prize,
    rifaTitle: winnerForm.value.rifaTitle,
    city: winnerForm.value.city,
    date: winnerForm.value.date,
    initials: initialsOf(winnerForm.value.name),
  }
  if (editingWinnerId.value) {
    updateWinner(editingWinnerId.value, data)
    winnerMsg.value = `"${data.name}" se actualizó correctamente.`
    editingWinnerId.value = null
  } else {
    addWinner(data)
    winnerMsg.value = `"${data.name}" se agregó como ganador.`
  }
  winnerForm.value = emptyWinnerForm()
  setTimeout(() => {
    winnerMsg.value = ''
  }, 4000)
}

function editWinner(w) {
  editingWinnerId.value = w.id
  winnerForm.value = { name: w.name, prize: w.prize, rifaTitle: w.rifaTitle, city: w.city || '', date: w.date }
}

function cancelWinnerEdit() {
  editingWinnerId.value = null
  winnerForm.value = emptyWinnerForm()
}

const statusOptions = ['Activa', 'Próxima', 'Cerrada']

function emptyScheduleForm() {
  return { title: '', prize: '', mon: '', day: '', time: '', status: 'Activa' }
}

const scheduleForm = ref(emptyScheduleForm())
const editingScheduleId = ref(null)
const scheduleMsg = ref('')

function handleScheduleSubmit() {
  const data = {
    title: scheduleForm.value.title,
    prize: scheduleForm.value.prize,
    mon: scheduleForm.value.mon.toUpperCase(),
    day: scheduleForm.value.day,
    time: scheduleForm.value.time,
    status: scheduleForm.value.status,
  }
  if (editingScheduleId.value) {
    updateScheduleItem(editingScheduleId.value, data)
    scheduleMsg.value = `"${data.title}" se actualizó correctamente.`
    editingScheduleId.value = null
  } else {
    addScheduleItem(data)
    scheduleMsg.value = `"${data.title}" se agregó a la agenda.`
  }
  scheduleForm.value = emptyScheduleForm()
  setTimeout(() => {
    scheduleMsg.value = ''
  }, 4000)
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
  <div class="screen">
    <header class="topbar">
      <BrandLogo :size="30" :label="16" />
      <div class="topbar-actions">
        <router-link to="/" class="link-ghost">Ver sitio</router-link>
        <button class="link-ghost" @click="handleLogout">Cerrar sesión</button>
      </div>
    </header>

    <div class="content">
      <h1 class="page-title">Panel de administrador</h1>
      <p class="page-sub">Crea nuevas rifas y gestiona las que ya están publicadas.</p>

      <section class="admin-section">
        <h2 class="section-heading">Rifas</h2>
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
                <button class="row-toggle" @click="toggleRifaActive(r.id)">
                  {{ r.active ? 'Dar de baja' : 'Reactivar' }}
                </button>
                <button v-if="r.custom" class="row-delete" @click="removeRifa(r.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section class="admin-section">
        <h2 class="section-heading">Ganadores</h2>
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
                </div>
                <div class="row-actions">
                  <button class="row-toggle" @click="editWinner(w)">Editar</button>
                  <button class="row-delete" @click="removeWinner(w.id)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="admin-section">
        <h2 class="section-heading">Agenda · Próximos sorteos</h2>
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
                  <button class="row-delete" @click="removeScheduleItem(e.id)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="admin-section">
        <h2 class="section-heading">Pagos</h2>
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
                  {{ o.rifaTitle }} · {{ o.qty }} número(s) · ${{ o.total }} · {{ o.paymentMethod }} ·
                  comprobante: {{ o.proofName || 'sin archivo' }} · contacto: {{ o.buyerContact }}
                </div>
              </div>
              <div class="row-actions">
                <template v-if="o.status === 'pendiente'">
                  <button class="row-toggle approve" @click="setOrderStatus(o.id, 'verificado')">Aprobar</button>
                  <button class="row-delete" @click="setOrderStatus(o.id, 'rechazado')">Rechazar</button>
                </template>
                <button v-else class="row-toggle" @click="setOrderStatus(o.id, 'pendiente')">
                  Marcar pendiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.screen {
  width: 100%;
  min-height: 100vh;
  background: var(--panel);
  box-sizing: border-box;
}
.topbar {
  background: #fff;
  border-bottom: 1px solid var(--line);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.link-ghost {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--slate-500);
  cursor: pointer;
  padding: 0;
}
.link-ghost:hover {
  color: var(--ink);
}
.content {
  padding: 28px 18px 60px;
  max-width: 1180px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 6px;
}
.page-sub {
  font-size: 14px;
  color: var(--slate-500);
  margin: 0 0 26px;
}
.admin-section {
  margin-bottom: 36px;
}
.admin-section:last-child {
  margin-bottom: 0;
}
.section-heading {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 14px;
}
.grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 22px;
}
.card-heading {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px;
}
.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--slate-700);
  display: block;
  margin-bottom: 6px;
}
.input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  border-radius: 9px;
  border: 1px solid var(--input-line);
  font-size: 14px;
  margin-bottom: 14px;
  outline: none;
  font-family: inherit;
  background: #fff;
}
.input:focus {
  border-color: var(--brand);
}
.textarea {
  resize: vertical;
  min-height: 72px;
  line-height: 1.5;
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.success-msg {
  font-size: 12.5px;
  color: #15803d;
  margin: -6px 0 14px;
}
.submit {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: var(--brand);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.submit:hover {
  background: var(--brand-dark);
}
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cancel-edit {
  background: none;
  border: none;
  font-family: inherit;
  color: var(--slate-500);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}
.cancel-edit:hover {
  color: var(--ink);
}
.empty-note {
  font-size: 13px;
  color: var(--slate-500);
  margin: 0;
}

.rifa-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rifa-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--line-soft);
  border-radius: 12px;
}
.rifa-row.row-inactive {
  opacity: 0.6;
  background: var(--panel);
}
.mini-badge {
  flex-shrink: 0;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.winner-badge {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background: var(--tint);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
.date-badge {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 10px;
  background: var(--brand);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.date-badge-mon {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.date-badge-day {
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}
.row-main {
  flex: 1;
  min-width: 0;
}
.row-title {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.row-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--slate-400);
}
.row-tag-off {
  color: #b45309;
}
.row-desc {
  font-size: 12.5px;
  color: var(--slate-500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-desc.wrap {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
.status-chip {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  text-transform: capitalize;
}
.status-pendiente {
  background: #fef9c3;
  color: #a16207;
}
.status-verificado {
  background: #dcfce7;
  color: #15803d;
}
.status-rechazado {
  background: #fee2e2;
  color: #dc2626;
}
.row-toggle.approve {
  border-color: #bbf7d0;
  color: #15803d;
}
.row-toggle.approve:hover {
  background: #f0fdf4;
}
.row-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.row-toggle {
  background: #fff;
  border: 1px solid var(--input-line);
  color: var(--slate-700);
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}
.row-toggle:hover {
  background: #f8fafc;
}
.row-delete {
  background: #fff;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}
.row-delete:hover {
  background: #fef2f2;
}

@media (min-width: 1024px) {
  .topbar {
    padding: 18px 56px;
  }
  .content {
    padding: 44px 56px 80px;
  }
  .page-title {
    font-size: 30px;
  }
  .page-sub {
    font-size: 15px;
    margin-bottom: 36px;
  }
  .grid {
    flex-direction: row;
    align-items: flex-start;
  }
  .form-card {
    flex: 1.1;
  }
  .list-card {
    flex: 0.9;
    position: sticky;
    top: 24px;
  }
  .rifa-list {
    max-height: 560px;
    overflow-y: auto;
  }
}
</style>
