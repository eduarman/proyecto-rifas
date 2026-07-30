import { reactive } from 'vue'

// Payment orders: created by customers at checkout, reviewed by the admin
// panel (aprobar/rechazar). No real payment gateway — matches the FAQ's
// "cargas el comprobante y validamos tu compra" manual-verification flow.
const STORAGE_KEY = 'rifly_orders'

function loadStoredOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function persistOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

function makeId() {
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export const orders = reactive(loadStoredOrders() || [])

export function addOrder(data) {
  const nuevo = { ...data, id: makeId(), status: 'pendiente', createdAt: new Date().toISOString() }
  orders.unshift(nuevo)
  persistOrders()
  return nuevo
}

export function setOrderStatus(id, status) {
  const order = orders.find((o) => o.id === id)
  if (order) {
    order.status = status
    persistOrders()
  }
}
