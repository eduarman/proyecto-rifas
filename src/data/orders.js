import { reactive } from 'vue'
import { supabase } from '../lib/supabase.js'

// Payment orders: created by customers at checkout, reviewed by the admin
// panel (aprobar/rechazar). No real payment gateway — matches the FAQ's
// "cargas el comprobante y validamos tu compra" manual-verification flow.
export const orders = reactive([])

function rowToOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    rifaId: row.rifa_id,
    rifaTitle: row.rifa_title,
    qty: row.qty,
    unitPrice: row.unit_price,
    total: row.total,
    paymentMethod: row.payment_method,
    buyerName: row.buyer_name,
    buyerContact: row.buyer_contact,
    proofPath: row.proof_path,
    status: row.status,
    createdAt: row.created_at,
  }
}

// Historial del cliente autenticado: la política RLS orders_select_own ya
// filtra por su propio user_id, no hace falta un .eq() en el cliente.
export async function fetchMyOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data.map(rowToOrder)
}

export async function loadOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (!error && data) orders.splice(0, orders.length, ...data.map(rowToOrder))
}

// Anonymous customers can upload (insert-only storage policy) but can't read
// the bucket back — only admin sessions can, via a signed URL.
export async function uploadProof(file) {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`
  const { error } = await supabase.storage.from('comprobantes').upload(path, file)
  if (error) throw error
  return path
}

export async function getProofSignedUrl(path) {
  const { data, error } = await supabase.storage.from('comprobantes').createSignedUrl(path, 60 * 5)
  if (error) return null
  return data.signedUrl
}

export async function addOrder(data) {
  const row = {
    user_id: data.userId || null,
    rifa_id: data.rifaId,
    rifa_title: data.rifaTitle,
    qty: data.qty,
    unit_price: data.unitPrice,
    total: data.total,
    payment_method: data.paymentMethod,
    buyer_name: data.buyerName,
    buyer_contact: data.buyerContact,
    proof_path: data.proofPath || null,
  }
  const { error } = await supabase.from('orders').insert(row)
  if (error) throw error
  // Anonymous inserts can't SELECT the row back (RLS is admin-only for
  // reads), so the confirmation screen uses what we already know locally
  // instead of re-querying it.
  return { ...data, id: null, status: 'pendiente', createdAt: new Date().toISOString() }
}

export async function setOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
  const order = orders.find((o) => o.id === id)
  if (order) order.status = status
}
