<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'
import { useNav } from '../composables/useNav.js'
import { signUp, signInWithGoogle } from '../composables/useCustomerAuth.js'

const route = useRoute()
const router = useRouter()
const { goHome, goLogin } = useNav()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const submitting = ref(false)
const awaitingConfirmation = ref(false)

const next = typeof route.query.next === 'string' ? route.query.next : ''

async function handleSubmit() {
  error.value = ''

  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  submitting.value = true
  const { data, error: signUpError } = await signUp({
    email: email.value,
    password: password.value,
    fullName: fullName.value,
  })
  submitting.value = false

  if (signUpError) {
    error.value = signUpError.message === 'User already registered'
      ? 'Ya existe una cuenta con ese correo.'
      : signUpError.message
    return
  }

  // Con confirmación de correo activada, Supabase no devuelve sesión todavía.
  if (data.session) {
    next ? router.push(next) : goHome()
  } else {
    awaitingConfirmation.value = true
  }
}

async function handleGoogle() {
  error.value = ''
  const { error: googleError } = await signInWithGoogle(next)
  if (googleError) error.value = googleError.message
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

    <div v-if="awaitingConfirmation" class="panel">
      <h1 class="title">Revisa tu correo</h1>
      <p class="lead">
        Te enviamos un enlace de confirmación a <strong>{{ email }}</strong>. Ábrelo para activar
        tu cuenta y luego inicia sesión.
      </p>
      <button class="submit" @click="goLogin(next ? { next } : undefined)">Ir a iniciar sesión</button>
    </div>

    <form v-else class="panel" @submit.prevent="handleSubmit">
      <h1 class="title">Crea tu cuenta</h1>
      <p class="lead">Regístrate para participar en las rifas.</p>

      <label class="field-label">Nombre completo</label>
      <input v-model="fullName" required class="input" placeholder="Tu nombre" />

      <label class="field-label">Correo electrónico</label>
      <input v-model="email" type="email" required placeholder="tucorreo@ejemplo.com" class="input" />

      <label class="field-label">Contraseña</label>
      <input v-model="password" type="password" required placeholder="Mínimo 6 caracteres" class="input" />

      <label class="field-label">Confirmar contraseña</label>
      <input v-model="confirmPassword" type="password" required placeholder="••••••••" class="input" />

      <p v-if="error" class="error-msg">{{ error }}</p>

      <button type="submit" class="submit" :disabled="submitting">
        {{ submitting ? 'Creando cuenta…' : 'Crear cuenta' }}
      </button>

      <div class="divider">
        <div class="line" />
        <span class="or">o continúa con</span>
        <div class="line" />
      </div>

      <button type="button" class="google" @click="handleGoogle">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.05H2.18a11 11 0 000 9.9l3.66-2.85z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" />
        </svg>
        Continuar con Google
      </button>

      <p class="signup">¿Ya tienes cuenta? <a href="#" @click.prevent="goLogin(next ? { next } : undefined)">Ingresa aquí</a></p>
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
  .google:hover {
    background: #f8fafc;
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
  opacity: 0.65;
  cursor: default;
}
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
}
.line {
  flex: 1;
  height: 1px;
  background: var(--line);
}
.or {
  font-size: 12px;
  color: var(--slate-400);
}
.google {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--input-line);
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}
.signup {
  text-align: center;
  font-size: 13px;
  color: var(--slate-500);
  margin: 20px 0 0;
}
</style>
