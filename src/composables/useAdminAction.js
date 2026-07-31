import { ref } from 'vue'

// Wraps admin mutations so a failed insert/update (network hiccup, RLS
// rejection) shows up instead of silently doing nothing.
export function useAdminAction() {
  const errorMsg = ref('')

  async function run(fn) {
    try {
      await fn()
    } catch (e) {
      errorMsg.value = e?.message || 'Ocurrió un error. Intenta de nuevo.'
      setTimeout(() => {
        errorMsg.value = ''
      }, 5000)
    }
  }

  return { errorMsg, run }
}
