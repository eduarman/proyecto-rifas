// Content extracted verbatim from the Rifly Mobile prototype.
// `icon` fields hold the inner SVG markup rendered inside a 24x24 viewBox.

import { reactive } from 'vue'
import { supabase } from '../lib/supabase.js'

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

export const schedule = reactive([])

function rowToSchedule(row) {
  return { id: row.id, title: row.title, prize: row.prize, mon: row.mon, day: row.day, time: row.time, status: row.status }
}

function scheduleToRow(data) {
  return { title: data.title, prize: data.prize, mon: data.mon, day: data.day, time: data.time, status: data.status }
}

export async function loadSchedule() {
  const { data, error } = await supabase.from('schedule').select('*').order('created_at')
  if (!error && data) schedule.splice(0, schedule.length, ...data.map(rowToSchedule))
}

export async function addScheduleItem(data) {
  const { data: inserted, error } = await supabase
    .from('schedule')
    .insert(scheduleToRow(data))
    .select()
    .single()
  if (error) throw error
  const nuevo = rowToSchedule(inserted)
  schedule.push(nuevo)
  return nuevo
}

export async function updateScheduleItem(id, data) {
  const { error } = await supabase.from('schedule').update(scheduleToRow(data)).eq('id', id)
  if (error) throw error
  const idx = schedule.findIndex((e) => e.id === id)
  if (idx !== -1) schedule[idx] = { ...schedule[idx], ...data }
}

export async function removeScheduleItem(id) {
  const { error } = await supabase.from('schedule').delete().eq('id', id)
  if (error) throw error
  const idx = schedule.findIndex((e) => e.id === id)
  if (idx !== -1) schedule.splice(idx, 1)
}

loadSchedule()

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

export const rifas = reactive([])

function rowToRifa(row) {
  return {
    id: row.id,
    badge: row.badge,
    badgeBg: row.badge_bg,
    badgeColor: row.badge_color,
    title: row.title,
    desc: row.short_desc,
    longDesc: row.long_desc,
    sold: row.sold,
    available: row.available,
    date: row.date,
    price: row.price,
    imageLabel: row.image_label,
    active: row.active,
    custom: row.custom,
  }
}

function rifaToRow(data) {
  return {
    badge: data.badge,
    badge_bg: data.badgeBg,
    badge_color: data.badgeColor,
    title: data.title,
    short_desc: data.desc,
    long_desc: data.longDesc,
    sold: data.sold,
    available: data.available,
    date: data.date,
    price: data.price,
    image_label: data.imageLabel,
  }
}

export async function loadRifas() {
  const { data, error } = await supabase.from('rifas').select('*').order('created_at')
  if (!error && data) rifas.splice(0, rifas.length, ...data.map(rowToRifa))
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
export async function addRifa(data) {
  let id = slugify(data.title)
  if (rifas.some((r) => r.id === id)) id += `-${Date.now().toString(36)}`
  const row = { id, ...rifaToRow(data), active: true, custom: true }
  const { data: inserted, error } = await supabase.from('rifas').insert(row).select().single()
  if (error) throw error
  const nueva = rowToRifa(inserted)
  rifas.unshift(nueva)
  return nueva
}

// Hard delete: only for rifas created in the admin panel. Seed rifas from the
// prototype can only be deactivated, never removed outright.
export async function removeRifa(id) {
  const rifa = rifas.find((r) => r.id === id && r.custom)
  if (!rifa) return
  const { error } = await supabase.from('rifas').delete().eq('id', id)
  if (error) throw error
  const idx = rifas.findIndex((r) => r.id === id)
  if (idx !== -1) rifas.splice(idx, 1)
}

// Soft delete for any rifa (seed or custom): hides it from public views
// while keeping it manageable from the admin panel.
export async function toggleRifaActive(id) {
  const rifa = rifas.find((r) => r.id === id)
  if (!rifa) return
  const { error } = await supabase.from('rifas').update({ active: !rifa.active }).eq('id', id)
  if (error) throw error
  rifa.active = !rifa.active
}

loadRifas()
