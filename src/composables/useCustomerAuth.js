import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

// Real Supabase Auth for customers (separate from admin auth in useAuth.js —
// different concern, and the router's admin guard depends on that module's
// exact exports, so this stays its own module instead of merging in).
export const customerSession = ref(null)

export const customerAuthReady = supabase.auth.getSession().then(({ data }) => {
  customerSession.value = data.session
})

supabase.auth.onAuthStateChange((_event, session) => {
  customerSession.value = session
})

export async function signUp({ email, password, fullName }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithGoogle(redirectPath = '') {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + redirectPath },
  })
}

export async function sendPasswordResetEmail(email) {
  return supabase.auth.resetPasswordForEmail(email)
}

export async function signOut() {
  await supabase.auth.signOut()
}
