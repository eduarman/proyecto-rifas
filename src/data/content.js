// Content extracted verbatim from the Rifly Mobile prototype.
// `icon` fields hold the inner SVG markup rendered inside a 24x24 viewBox.

import { reactive } from 'vue'

export const steps = [
  {
    n: '01',
    title: 'Elige tu rifa',
    desc: 'Explora rifas activas y descubre los premios.',
    icon: '<circle cx="11" cy="11" r="6" stroke="#2563eb" stroke-width="2"/><path d="M20 20l-4-4" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    n: '02',
    title: 'Selecciona números',
    desc: 'Elige tus favoritos o deja que el sistema los asigne.',
    icon: '<rect x="3" y="6" width="18" height="12" rx="2" stroke="#2563eb" stroke-width="2"/><path d="M3 10h18" stroke="#2563eb" stroke-width="2"/>',
  },
  {
    n: '03',
    title: 'Envía tu pago',
    desc: 'Paga por Pago Móvil, transferencia, Zelle o USDT.',
    icon: '<path d="M12 16V4M7 9l5-5 5 5" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>',
  },
  {
    n: '04',
    title: 'Espera el sorteo',
    desc: 'Sigue el sorteo en vivo y consulta tu estado.',
    icon: '<path d="M12 3l1.8 4.9 5.2.5-4 3.4 1.3 5.1L12 14l-4.3 2.9 1.3-5.1-4-3.4 5.2-.5z" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/>',
  },
]

export const features = [
  {
    title: 'Pagos seguros',
    desc: 'Validación manual de cada comprobante para mayor confianza.',
    icon: '<path d="M12 3l7 3v5c0 5-3 8-7 9-4-1-7-4-7-9V6z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>',
  },
  {
    title: 'Compra en 2 minutos',
    desc: 'Flujo optimizado, sin trámites innecesarios.',
    icon: '<path d="M13 2L3 14h7l-1 8 10-12h-7z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round" fill="#fff"/>',
  },
  {
    title: 'Premios reales',
    desc: 'Publicamos los ganadores con evidencia verificable.',
    icon: '<path d="M8 4h8v4a4 4 0 01-4 4 4 4 0 01-4-4z" stroke="#fff" stroke-width="1.8"/><path d="M12 12v4m-3 4h6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  },
  {
    title: 'Múltiples métodos',
    desc: 'Pago Móvil, transferencia, Zelle y USDT.',
    icon: '<rect x="3" y="6" width="18" height="12" rx="2" stroke="#fff" stroke-width="1.8"/><path d="M3 10h18" stroke="#fff" stroke-width="1.8"/>',
  },
  {
    title: 'Soporte humano',
    desc: 'Atención por WhatsApp para resolver cualquier duda.',
    icon: '<path d="M12 21s-7-4.35-7-10a5 5 0 0110-1 5 5 0 0110 1c0 5.65-7 10-7 10z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>',
  },
  {
    title: 'Sorteos puntuales',
    desc: 'Fechas anunciadas y respetadas. Sin retrasos.',
    icon: '<circle cx="12" cy="12" r="9" stroke="#fff" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  },
]

export const testimonials = [
  {
    initials: 'MG',
    name: 'María González',
    city: 'Caracas',
    quote:
      'Compré un número, gané un iPhone y recibí mi premio en dos días. Todo súper transparente.',
  },
  {
    initials: 'CR',
    name: 'Carlos Rodríguez',
    city: 'Valencia',
    quote:
      'El proceso es muy rápido. Pagué por Pago Móvil y me confirmaron en minutos. Recomendado.',
  },
  {
    initials: 'AP',
    name: 'Andrea Pérez',
    city: 'Maracaibo',
    quote:
      'Me encanta que muestran el sorteo en vivo. Es la primera vez que confío en algo así.',
  },
]

const SCHEDULE_STORAGE_KEY = 'rifly_schedule'

function loadStoredSchedule() {
  try {
    return JSON.parse(localStorage.getItem(SCHEDULE_STORAGE_KEY))
  } catch {
    return null
  }
}

function persistSchedule() {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule))
}

function makeScheduleId() {
  return `sch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const seedSchedule = [
  { id: 'sch-seed-1', mon: 'JUL', day: '30', title: 'Gran Sorteo Deportivo', prize: 'Auto + $5.000', time: '8:00 PM', status: 'Activa' },
  { id: 'sch-seed-2', mon: 'AGO', day: '05', title: 'Rifa Tech', prize: 'iPhone 15 Pro Max', time: '9:00 PM', status: 'Activa' },
  { id: 'sch-seed-3', mon: 'AGO', day: '12', title: 'Rifa Efectivo', prize: '$3.000 USD', time: '8:30 PM', status: 'Activa' },
  { id: 'sch-seed-4', mon: 'AGO', day: '20', title: 'Rifa Viaje', prize: 'Viaje a Margarita', time: '9:00 PM', status: 'Activa' },
]

export const schedule = reactive(loadStoredSchedule() || seedSchedule)

export function addScheduleItem(data) {
  const nuevo = { ...data, id: makeScheduleId() }
  schedule.push(nuevo)
  persistSchedule()
  return nuevo
}

export function updateScheduleItem(id, data) {
  const idx = schedule.findIndex((e) => e.id === id)
  if (idx !== -1) {
    schedule[idx] = { ...schedule[idx], ...data }
    persistSchedule()
  }
}

export function removeScheduleItem(id) {
  const idx = schedule.findIndex((e) => e.id === id)
  if (idx !== -1) {
    schedule.splice(idx, 1)
    persistSchedule()
  }
}

export const faqs = [
  {
    question: '¿Cómo sé que el sorteo es real?',
    answer:
      'Cada sorteo se transmite en vivo por nuestras redes y queda grabado para verificación pública.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer:
      'Aceptamos Pago Móvil, transferencia bancaria, Zelle y USDT. Después del pago, cargas el comprobante y validamos tu compra.',
  },
  {
    question: '¿En cuánto tiempo validan mi pago?',
    answer:
      'La mayoría de los pagos se validan en menos de una hora en horario laboral.',
  },
  {
    question: '¿Qué pasa si gano?',
    answer:
      'Te contactamos de inmediato y coordinamos la entrega del premio o la transferencia del efectivo.',
  },
  {
    question: '¿Puedo elegir mis números?',
    answer:
      'Sí, puedes elegir tus números favoritos o dejar que el sistema te los asigne al azar.',
  },
]

const STORAGE_KEY = 'rifly_rifas'

// Persists the whole list (seed + custom) so a deactivated seed rifa stays
// deactivated after reload — not just the admin-created ones.
function loadStoredRifas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function persistRifas() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rifas))
}

// Strips combining diacritics (U+0300-U+036F) left over after NFD normalization,
// e.g. "Rifa Épica" -> "rifa-epica" instead of keeping the accent as a stray mark.
const DIACRITICS = /[̀-ͯ]/g

function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(DIACRITICS, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'rifa'
  )
}

// Created via the admin panel; new entries go first so they show up
// immediately in the listing and the schedule stays reactive app-wide.
export function addRifa(data) {
  let id = slugify(data.title)
  if (rifas.some((r) => r.id === id)) id += `-${Date.now().toString(36)}`
  const nueva = { ...data, id, custom: true, active: true }
  rifas.unshift(nueva)
  persistRifas()
  return nueva
}

// Hard delete: only for rifas created in the admin panel. Seed rifas from the
// prototype can only be deactivated, never removed outright.
export function removeRifa(id) {
  const idx = rifas.findIndex((r) => r.id === id && r.custom)
  if (idx !== -1) {
    rifas.splice(idx, 1)
    persistRifas()
  }
}

// Soft delete for any rifa (seed or custom): hides it from public views
// while keeping it manageable from the admin panel.
export function toggleRifaActive(id) {
  const rifa = rifas.find((r) => r.id === id)
  if (rifa) {
    rifa.active = !rifa.active
    persistRifas()
  }
}

const seedRifas = [
  {
    id: 'auto',
    badge: '🔥 Más popular',
    badgeBg: '#fee2e2',
    badgeColor: '#dc2626',
    title: 'Gran Sorteo Deportivo',
    desc: 'Auto deportivo azul + $5.000',
    longDesc:
      'Un auto deportivo azul 0km totalmente equipado, más $5.000 en efectivo para gastos de patentamiento y seguro.',
    sold: 82,
    available: 180,
    date: '30 de julio',
    price: 5,
    imageLabel: 'foto: auto deportivo azul',
    active: true,
  },
  {
    id: 'tech',
    badge: 'Nueva',
    badgeBg: '#eef2ff',
    badgeColor: '#4338ca',
    title: 'Rifa Tech',
    desc: 'iPhone 15 Pro Max + AirPods',
    longDesc:
      'iPhone 15 Pro Max de 256GB con AirPods Pro incluidos, entrega sellada de fábrica con garantía oficial.',
    sold: 34,
    available: 660,
    date: '5 de agosto',
    price: 3,
    imageLabel: 'foto: iPhone 15 Pro Max',
    active: true,
  },
  {
    id: 'cash',
    badge: 'Cierra pronto',
    badgeBg: '#fff7ed',
    badgeColor: '#b45309',
    title: 'Rifa Efectivo',
    desc: '$3.000 en efectivo',
    longDesc:
      '$3.000 en efectivo transferidos directamente a tu cuenta el mismo día del sorteo, sin retenciones.',
    sold: 80,
    available: 160,
    date: '12 de agosto',
    price: 2,
    imageLabel: 'foto: efectivo en billetes',
    active: true,
  },
]

export const rifas = reactive(loadStoredRifas() || seedRifas)
