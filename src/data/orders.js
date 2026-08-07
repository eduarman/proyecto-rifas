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
    buyerCedula: row.buyer_cedula,
    buyerCity: row.buyer_city,
    proofPath: row.proof_path,
    status: row.status,
    createdAt: row.created_at,
    numbers: (row.order_numbers || []).map((n) => n.number).sort((a, b) => a - b),
  }
}

const ORDER_SELECT = '*, order_numbers(number)'

// Historial del cliente autenticado: la política RLS orders_select_own ya
// filtra por su propio user_id, no hace falta un .eq() en el cliente.
export async function fetchMyOrders() {
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false })
  if (error) throw error
  return data.map(rowToOrder)
}

export async function loadOrders() {
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false })
  if (!error && data) orders.splice(0, orders.length, ...data.map(rowToOrder))
}

// Números ya ocupados (pendientes o verificados) de una rifa, para el
// selector de números de DetailView. RPC en vez de una consulta directa
// porque el público no tiene permiso de lectura sobre orders.
export async function fetchTakenNumbers(rifaId) {
  const { data, error } = await supabase.rpc('taken_numbers_for_rifa', { p_rifa_id: rifaId })
  if (error) throw error
  return data || []
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

// Crea el pedido y reserva sus números atómicamente vía RPC (ver
// create_order_with_numbers en la migración 002): si algún número ya fue
// tomado por otro pedido entre que el comprador lo vio libre y confirmó la
// compra, la función entera falla con unique_violation (código 23505) y no
// queda un pedido huérfano sin números.
export async function addOrder(data) {
  const { data: orderId, error } = await supabase.rpc('create_order_with_numbers', {
    p_rifa_id: data.rifaId,
    p_rifa_title: data.rifaTitle,
    p_numbers: data.numbers,
    p_unit_price: data.unitPrice,
    p_payment_method: data.paymentMethod,
    p_buyer_name: data.buyerName,
    p_buyer_contact: data.buyerContact,
    p_buyer_cedula: data.buyerCedula,
    p_buyer_city: data.buyerCity,
    p_proof_path: data.proofPath || null,
    p_user_id: data.userId || null,
  })
  if (error) {
    if (error.code === '23505') {
      throw new Error('Uno o más números que elegiste ya fueron reservados por otra persona. Elige otros.')
    }
    throw error
  }
  notifyOrderByEmail(orderId, 'received')
  return {
    ...data,
    id: orderId,
    qty: data.numbers.length,
    total: data.unitPrice * data.numbers.length,
    status: 'pendiente',
    createdAt: new Date().toISOString(),
  }
}

export async function setOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
  const order = orders.find((o) => o.id === id)
  if (order) order.status = status
  if (status === 'verificado') notifyOrderByEmail(id, 'verified')
}

// El correo es una cortesía, no una condición de la compra: si Resend está
// caído o el secret no está configurado, el pedido ya quedó guardado igual y
// no queremos romper el checkout ni el aprobado del admin por esto.
function notifyOrderByEmail(orderId, kind) {
  supabase.functions.invoke('send-order-email', { body: { orderId, kind } }).catch((err) => {
    console.error('No se pudo enviar el correo de notificación:', err)
  })
}
