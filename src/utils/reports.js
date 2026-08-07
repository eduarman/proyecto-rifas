import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'

const STATUS_LABEL = {
  verificado: 'Verificado',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
}

const REPORT_COLUMNS = [
  { header: 'Número', key: 'numero', width: 12 },
  { header: 'Comprador', key: 'comprador', width: 28 },
  { header: 'Cédula', key: 'cedula', width: 16 },
  { header: 'Ciudad', key: 'ciudad', width: 18 },
  { header: 'Contacto', key: 'contacto', width: 22 },
  { header: 'Método de pago', key: 'metodoPago', width: 18 },
  { header: 'Estado', key: 'estado', width: 14 },
]

// Una fila por cada número 1..disponible. Los pedidos rechazados no ocupan
// su número (queda "Disponible" de nuevo), igual que la grilla de la vista.
function buildRows(row) {
  const numberOrder = {}
  for (const o of row.orders) {
    if (o.status === 'rechazado') continue
    for (const n of o.numbers || []) numberOrder[n] = o
  }

  const rows = []
  for (let n = 1; n <= row.disponible; n++) {
    const o = numberOrder[n]
    rows.push({
      numero: String(n).padStart(row.numberWidth, '0'),
      comprador: o?.buyerName || '',
      cedula: o?.buyerCedula || '',
      ciudad: o?.buyerCity || '',
      contacto: o?.buyerContact || '',
      metodoPago: o?.paymentMethod || '',
      estado: o ? STATUS_LABEL[o.status] || o.status : 'Disponible',
    })
  }
  return rows
}

function safeFileName(title) {
  return (
    title
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'rifa'
  )
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportRifaExcel(row) {
  const rows = buildRows(row)
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet((row.title || 'Rifa').slice(0, 31))
  sheet.columns = REPORT_COLUMNS
  sheet.getRow(1).font = { bold: true }
  sheet.addRows(rows)

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `ventas-${safeFileName(row.title)}.xlsx`,
  )
}

export function exportRifaPdf(row) {
  const rows = buildRows(row)
  const doc = new jsPDF()

  doc.setFontSize(14)
  doc.text(`Reporte de ventas — ${row.title}`, 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Vendidos: ${row.vendidos} / ${row.disponible} · Generado: ${new Date().toLocaleString('es-VE')}`, 14, 23)

  autoTable(doc, {
    startY: 28,
    head: [REPORT_COLUMNS.map((c) => c.header)],
    body: rows.map((r) => REPORT_COLUMNS.map((c) => r[c.key])),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save(`ventas-${safeFileName(row.title)}.pdf`)
}
