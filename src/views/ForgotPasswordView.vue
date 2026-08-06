<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import { useNav } from '../composables/useNav.js'
import { sendPasswordResetEmail } from '../composables/useCustomerAuth.js'

const router = useRouter()
const { goHome } = useNav()

const email = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  message.value = ''
  if (!email.value) {
    error.value = 'Por favor ingresa tu correo electrónico.'
    return
  }

  submitting.value = true
  const { error: resetError } = await sendPasswordResetEmail(email.value)
  submitting.value = false

  if (resetError) {
    error.value = resetError.message
    return
  }

  message.value = 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña.'
}

function goLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="screen">
    <div class="back" @click="goHome">
      <svg width="17" height="17" viewBox="0 0 24 24">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
      Volver al inicio
    </div>

    <div class="brand-row">
      <BrandLogo :size="34" :label="20" />
    </div>

    <form class="panel" @submit.prevent="handleSubmit">
      <h1 class="title">Recuperar contraseña</h1>
      <p class="lead">Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecerla.</p>

      <label class="field-label">Correo electrónico</label>
      <input v-model="email" type="email" placeholder="tucorreo@ejemplo.com" class="input" />

      <p v-if="error" class="error-msg">{{ error }}</p>
      <p v-if="message" class="success-msg">{{ message }}</p>

      <button type="submit" class="submit" :disabled="submitting">
        {{ submitting ? 'Enviando…' : 'Enviar enlace' }}
      </button>

      <p class="signup">¿Ya recuerdas tu contraseña? <a href="#" @click.prevent="goLogin">Inicia sesión</a></p>
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
.panel {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 16px 40px -20px rgba(15, 23, 42, 0.15);
  padding: 24px 20px;
  width: 100%;
  box-sizing: border-box;
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
    width: 420px;
    max-width: 92vw;
    border-radius: 20px;
    box-shadow: 0 20px 50px -20px rgba(15, 23, 42, 0.15);
    padding: 36px 36px 32px;
  }
  .submit:hover {
    background: var(--brand-dark);
  }
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
.error-msg {
  font-size: 12.5px;
  color: #dc2626;
  margin: -6px 0 14px;
}
.success-msg {
  font-size: 12.5px;
  color: #16a34a;
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
.signup {
  margin: 18px 0 0;
  font-size: 13px;
  color: var(--slate-500);
}
.signup a {
  color: var(--brand);
  text-decoration: none;
}
.signup a:hover {
  text-decoration: underline;
}
</style>
