import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

// Real Supabase Auth. "Admin" is whoever's user id is listed in the
// `admins` table (checked server-side via RLS' is_admin(), re-checked here
// only to drive the UI/router-guard reactively).
export const isAdmin = ref(false)

async function refreshAdminStatus(userId) {
  if (!userId) {
    isAdmin.value = false
    return
  }
  // The `admins` table itself is locked down to "no client access" — even
  // the row's own owner can't SELECT it directly. is_admin() is SECURITY
  // DEFINER, so calling it via RPC bypasses that and answers truthfully.
  const { data, error } = await supabase.rpc('is_admin')
  isAdmin.value = !error && data === true
}

// Resolves once the initial session (if any) has been restored and checked
// against the admins table — the router guard awaits this before deciding.
export const authReady = supabase.auth.getSession().then(async ({ data }) => {
  await refreshAdminStatus(data.session?.user?.id)
})

supabase.auth.onAuthStateChange((_event, session) => {
  refreshAdminStatus(session?.user?.id)
})

export async function loginAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return false
  await refreshAdminStatus(data.user.id)
  if (!isAdmin.value) {
    await supabase.auth.signOut()
    return false
  }
  return true
}

export async function logoutAdmin() {
  await supabase.auth.signOut()
  isAdmin.value = false
}
