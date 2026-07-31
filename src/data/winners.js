import { reactive } from 'vue'
import { supabase } from '../lib/supabase.js'

// Winner records managed from the admin panel. Publicly readable — the ones
// with a comment are shown as testimonials on the home page.
export const winners = reactive([])

function rowToWinner(row) {
  return {
    id: row.id,
    name: row.name,
    prize: row.prize,
    rifaTitle: row.rifa_title,
    city: row.city,
    date: row.date,
    initials: row.initials,
    comment: row.comment,
  }
}

function winnerToRow(data) {
  return {
    name: data.name,
    prize: data.prize,
    rifa_title: data.rifaTitle,
    city: data.city || null,
    date: data.date,
    initials: data.initials,
    comment: data.comment || null,
  }
}

export async function loadWinners() {
  const { data, error } = await supabase.from('winners').select('*').order('created_at', { ascending: false })
  if (!error && data) winners.splice(0, winners.length, ...data.map(rowToWinner))
}

export async function addWinner(data) {
  const { data: inserted, error } = await supabase
    .from('winners')
    .insert(winnerToRow(data))
    .select()
    .single()
  if (error) throw error
  const nuevo = rowToWinner(inserted)
  winners.unshift(nuevo)
  return nuevo
}

export async function updateWinner(id, data) {
  const { error } = await supabase.from('winners').update(winnerToRow(data)).eq('id', id)
  if (error) throw error
  const idx = winners.findIndex((w) => w.id === id)
  if (idx !== -1) winners[idx] = { ...winners[idx], ...data }
}

export async function removeWinner(id) {
  const { error } = await supabase.from('winners').delete().eq('id', id)
  if (error) throw error
  const idx = winners.findIndex((w) => w.id === id)
  if (idx !== -1) winners.splice(idx, 1)
}

loadWinners()
