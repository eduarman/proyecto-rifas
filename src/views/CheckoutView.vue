<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import { rifas } from '../data/content.js'
import { addOrder, uploadProof } from '../data/orders.js'
import { useNav } from '../composables/useNav.js'
import { customerSession } from '../composables/useCustomerAuth.js'

const route = useRoute()
const router = useRouter()
const { goHome } = useNav()

// Deactivated rifas are excluded, same rule as the detail/listing views.
const selectedRifa = computed(
  () =>
    rifas.find((r) => r.id === route.params.id && r.active) ||
    rifas.find((r) => r.active),
)
const qty = computed(() => Math.max(1, Number(route.query.qty) || 1))
const total = computed(() => qty.value * (selectedRifa.value?.price ?? 0))

function goBack() {
  router.push({ name: 'detail', params: { id: route.params.id } })
}

// Mock account details per method — no real payment gateway; matches the
// FAQ's manual-verification flow (cargas el comprobante y validamos tu compra).
const paymentMethods = [
  {
    id: 'movil',
    label: 'Pago Móvil',
    details: [
      ['Banco', 'Banesco (0134)'],
      ['Teléfono', '0412-123-4567'],
      ['Cédula/RIF', 'V-12.345.678'],
    ],
  },
  {
    id: 'transferencia',
    label: 'Transferencia',
    details: [
      ['Banco', 'Banesco'],
      ['Cuenta corriente', '0134-0123-45-1234567890'],
      ['Titular', 'Rifly Rifas C.A.'],
      ['RIF', 'J-12345678-9'],
    ],
  },
  {
    id: 'zelle',
    label: 'Zelle',
    details: [
      ['Correo', 'pagos@rifly.com'],
      ['Titular', 'Rifly LLC'],
    ],
  },
  {
    id: 'usdt',
    label: 'USDT',
    details: [
      ['Red', 'Tron (TRC20)'],
      ['Dirección', 'TXn9Y8ExampleWalletAddress000'],
    ],
  },
]

const selectedMethod = ref(paymentMethods[0].id)
const currentMethod = computed(() => paymentMethods.find((m) => m.id === selectedMethod.value))

// El router ya garantiza sesión (meta.requiresCustomer) antes de llegar aquí,
// así que precargamos nombre/correo de la cuenta — el comprador puede editarlos.
const accountUser = customerSession.value?.user
const buyerName = ref(accountUser?.user_metadata?.full_name || '')
const buyerContact = ref(accountUser?.email || '')
const fileName = ref('')
const selectedFile = ref(null)
const submitted = ref(false)
const submitting = ref(false)
const submitError = ref('')

function handleFile(e) {
  const file = e.target.files[0] || null
  selectedFile.value = file
  fileName.value = file?.name || ''
}

async function handleSubmit() {
  submitting.value = true
  submitError.value = ''
  try {
    const proofPath = selectedFile.value ? await uploadProof(selectedFile.value) : null
    await addOrder({
      userId: accountUser?.id,
      rifaId: selectedRifa.value.id,
      rifaTitle: selectedRifa.value.title,
      qty: qty.value,
      unitPrice: selectedRifa.value.price,
      total: total.value,
      paymentMethod: currentMethod.value.label,
      buyerName: buyerName.value,
      buyerContact: buyerContact.value,
      proofPath,
    })
    submitted.value = true
  } catch {
    submitError.value = 'Ocurrió un error al enviar tu comprobante. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="screen">
    <div class="back" @click="goBack">
      <svg width="17" height="17" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
      Volver a la rifa
    </div>

    <div class="brand-row">
      <BrandLogo :size="34" :label="20" />
    </div>

    <p v-if="!selectedRifa" class="empty-state">No hay rifas disponibles en este momento.</p>

    <div v-else-if="submitted" class="panel confirm-panel">
      <div class="confirm-icon">✓</div>
      <h1 class="title">¡Comprobante recibido!</h1>
      <p class="lead">
        Tu pago de <strong>${{ total }}</strong> por {{ qty }} número(s) de "{{ selectedRifa.title }}" quedó
        pendiente de verificación. Te contactaremos a <strong>{{ buyerContact }}</strong> en cuanto lo confirmemos.
      </p>
      <button class="submit" @click="goHome">Volver al inicio</button>
    </div>

    <form v-else class="panel" @submit.prevent="handleSubmit">
      <h1 class="title">Completa tu pago</h1>
      <p class="lead">
        {{ selectedRifa.title }} · {{ qty }} número(s) · Total <strong>${{ total }}</strong>
      </p>

      <label class="field-label">Método de pago</label>
      <div class="method-tabs">
        <button
          v-for="m in paymentMethods"
          :key="m.id"
          type="button"
          class="method-tab"
          :class="{ active: m.id === selectedMethod }"
          @click="selectedMethod = m.id"
        >
          {{ m.label }}
        </button>
      </div>

      <div class="method-details">
        <div v-for="[k, v] in currentMethod.details" :key="k" class="detail-row">
          <span class="detail-k">{{ k }}</span>
          <span class="detail-v">{{ v }}</span>
        </div>
      </div>

      <label class="field-label">Nombre completo</label>
      <input v-model="buyerName" required class="input" placeholder="Ej: Ana Torres" />

      <label class="field-label">Correo o teléfono de contacto</label>
      <input v-model="buyerContact" required class="input" placeholder="Ej: ana@correo.com" />

      <label class="field-label">Comprobante de pago</label>
      <input type="file" accept="image/*,.pdf" required class="input file-input" @change="handleFile" />
      <p v-if="fileName" class="file-name">Archivo: {{ fileName }}</p>

      <p v-if="submitError" class="error-msg">{{ submitError }}</p>

      <button type="submit" class="submit" :disabled="submitting">
        {{ submitting ? 'Enviando...' : 'Enviar comprobante' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.screen {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #eef4ff 0%, #ffffff 40%);
  padding: 24px 20px 40px;
  box-sizing: border-box;
}
.back {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--slate-500);
  font-size: 14px;
  margin-bottom: 28px;
  width: fit-content;
  cursor: pointer;
}
.brand-row {
  margin-bottom: 30px;
}
.empty-state {
  padding: 40px 18px;
  text-align: center;
  color: var(--slate-500);
  font-size: 14px;
}
.panel {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 16px 40px -20px rgba(15, 23, 42, 0.15);
  padding: 24px 20px;
  width: 100%;
  box-sizing: border-box;
}
.title {
  font-size: 21px;
  font-weight: 700;
  margin: 0 0 6px;
}
.lead {
  font-size: 13.5px;
  color: var(--slate-500);
  margin: 0 0 22px;
  line-height: 1.6;
}
.field-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--slate-700);
  display: block;
  margin-bottom: 8px;
}
.method-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.method-tab {
  flex: 1 1 calc(50% - 4px);
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid var(--input-line);
  background: #fff;
  color: var(--slate-700);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.method-tab.active {
  border-color: var(--brand);
  background: var(--tint);
  color: var(--brand);
}
.method-details {
  background: var(--panel);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  padding: 4px 0;
}
.detail-k {
  color: var(--slate-500);
}
.detail-v {
  font-weight: 700;
  text-align: right;
}
.input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--input-line);
  font-size: 14.5px;
  margin-bottom: 16px;
  outline: none;
  font-family: inherit;
}
.input:focus {
  border-color: var(--brand);
}
.file-input {
  padding: 10px 14px;
  cursor: pointer;
}
.file-name {
  font-size: 12.5px;
  color: var(--slate-500);
  margin: -10px 0 16px;
}
.error-msg {
  font-size: 12.5px;
  color: #dc2626;
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
  margin-top: 4px;
}
.submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.confirm-panel {
  text-align: center;
}
.confirm-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
}

@media (min-width: 1024px) {
  .screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    position: relative;
  }
  .back {
    position: absolute;
    top: 32px;
    left: 40px;
    font-size: 15px;
    margin-bottom: 0;
  }
  .back:hover {
    color: var(--ink);
  }
  .brand-row {
    margin-bottom: 32px;
  }
  .panel {
    width: 460px;
    max-width: 92vw;
    border-radius: 20px;
    box-shadow: 0 20px 50px -20px rgba(15, 23, 42, 0.15);
    padding: 36px 36px 32px;
  }
  .submit:hover {
    background: var(--brand-dark);
  }
  .method-tab:hover {
    background: #f8fafc;
  }
}
</style>
