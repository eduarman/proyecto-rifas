import { ref } from 'vue'

// Mock admin auth for the prototype: no backend exists yet, so "session" is
// just a localStorage flag guarded by a hardcoded credential pair. This is
// enough to gate the /admin route during design/demo, not real security —
// swap for a real login endpoint + token before this goes to production.
const ADMIN_EMAIL = 'admin@rifly.com'
const ADMIN_PASSWORD = 'admin123'
const STORAGE_KEY = 'rifly_is_admin'

export const isAdmin = ref(localStorage.getItem(STORAGE_KEY) === 'true')

export function loginAdmin(email, password) {
  const ok = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD
  if (ok) {
    isAdmin.value = true
    localStorage.setItem(STORAGE_KEY, 'true')
  }
  return ok
}

export function logoutAdmin() {
  isAdmin.value = false
  localStorage.removeItem(STORAGE_KEY)
}
