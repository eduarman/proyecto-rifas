import { reactive } from 'vue'

// Winner records managed from the admin panel. Not shown on the public
// site yet — admin-only data management for now.
const STORAGE_KEY = 'rifly_winners'

function loadStoredWinners() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function persistWinners() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(winners))
}

function makeId() {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

const seedWinners = [
  {
    id: 'w-seed-1',
    name: 'María González',
    prize: 'iPhone 15 Pro Max',
    rifaTitle: 'Rifa Tech',
    city: 'Caracas',
    date: '2 de julio',
    initials: 'MG',
  },
  {
    id: 'w-seed-2',
    name: 'Carlos Rodríguez',
    prize: '$1.500 en efectivo',
    rifaTitle: 'Rifa Efectivo',
    city: 'Valencia',
    date: '18 de junio',
    initials: 'CR',
  },
]

export const winners = reactive(loadStoredWinners() || seedWinners)

export function addWinner(data) {
  const nuevo = { ...data, id: makeId() }
  winners.unshift(nuevo)
  persistWinners()
  return nuevo
}

export function updateWinner(id, data) {
  const idx = winners.findIndex((w) => w.id === id)
  if (idx !== -1) {
    winners[idx] = { ...winners[idx], ...data }
    persistWinners()
  }
}

export function removeWinner(id) {
  const idx = winners.findIndex((w) => w.id === id)
  if (idx !== -1) {
    winners.splice(idx, 1)
    persistWinners()
  }
}
