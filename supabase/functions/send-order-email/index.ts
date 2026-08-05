// Edge Function: envía al comprador un correo con sus números y la rifa.
// Se invoca desde el cliente (src/data/orders.js) en dos momentos:
//   kind = "received" -> justo al subir el comprobante (checkout).
//   kind = "verified" -> cuando el admin aprueba el pedido (AdminPagosView).
//
// Usa la service role key (inyectada automáticamente por el runtime de
// Supabase en toda Edge Function) para leer el pedido sin depender de las
// policies de RLS de orders/order_numbers.
//
// Requiere el secret RESEND_API_KEY (`supabase secrets set RESEND_API_KEY=...`).
// FROM_EMAIL es opcional; si no hay dominio verificado en Resend, dejar el
// default "onboarding@resend.dev" (Resend solo permite enviar con ese
// remitente al correo de la propia cuenta de Resend mientras no se verifique
// un dominio propio).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Rifly <onboarding@resend.dev>'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// Se invoca desde el navegador (supabase.functions.invoke en orders.js), así
// que necesita responder al preflight OPTIONS con estos headers o el POST
// real nunca sale del cliente (falla como CORS error, silencioso porque el
// caller solo hace console.error).
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUBJECTS = {
  received: (rifaTitle) => `Recibimos tu comprobante — ${rifaTitle}`,
  verified: (rifaTitle) => `¡Compra verificada! — ${rifaTitle}`,
}

function renderEmail(kind, order) {
  const numbers = order.order_numbers.map((n) => n.number).sort((a, b) => a - b)
  const numbersHtml = numbers.map((n) => `<span style="display:inline-block;background:#eef2ff;color:#4338ca;font-weight:700;border-radius:6px;padding:4px 10px;margin:2px">${n}</span>`).join(' ')

  const intro =
    kind === 'verified'
      ? 'Tu pago fue verificado y tus números quedaron confirmados para el sorteo.'
      : 'Recibimos tu comprobante de pago. Tus números quedan reservados mientras lo verificamos.'

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="margin-bottom:4px">${order.rifa_title}</h2>
      <p style="color:#475569">${intro}</p>
      <p style="margin:18px 0 6px;font-weight:700">Tus números:</p>
      <div>${numbersHtml}</div>
      <p style="margin-top:20px;color:#475569">
        Comprador: ${order.buyer_name}<br />
        Total: $${order.total}<br />
        Método de pago: ${order.payment_method}
      </p>
    </div>
  `
  return { subject: SUBJECTS[kind](order.rifa_title), html }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const { orderId, kind } = await req.json()
    if (!orderId || !SUBJECTS[kind]) {
      return new Response(JSON.stringify({ error: 'orderId y kind (received|verified) son requeridos' }), {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('rifa_title, buyer_name, buyer_contact, total, payment_method, order_numbers(number)')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return new Response(JSON.stringify({ error: error?.message || 'Pedido no encontrado' }), {
        status: 404,
        headers: CORS_HEADERS,
      })
    }

    const { subject, html } = renderEmail(kind, order)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: order.buyer_contact,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      return new Response(JSON.stringify({ error: `Resend error: ${body}` }), { status: 502, headers: CORS_HEADERS })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS })
  }
})
