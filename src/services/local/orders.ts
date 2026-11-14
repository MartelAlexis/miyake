import { today } from '@/core/format'
import { shippingFor } from '@/core/pricing'
import { fail, ok } from '@/core/result'
import { getSession } from '@/core/session'
import type { Order } from '@/core/types'
import type { OrdersService, SalesService } from '../contracts'
import { mutate, read } from './storage'

/* Esta lógica (stock, ventas, cancelaciones) es la que tendrá que vivir en el servidor. */
export const localOrders: OrdersService = {
  async list() { return read().orders },
  async listMine() { const id = getSession()?.user.id; return id ? read().orders.filter(o => o.userId === id) : [] },
  async getByNumber(number) { return read().orders.find(o => o.number === number) ?? null },

  async place(input) {
    const s = getSession()
    const userId = s?.user.role === 'cliente' ? s.user.id : undefined // con backend lo deduce el servidor desde el token
    return mutate(db => {
      for (const it of input.items) {
        const p = db.products.find(x => x.code === it.code)
        if (!p) return fail<Order>(`"${it.description}" ya no está disponible`)
        if (p.stock < it.qty) return fail<Order>(`Stock insuficiente de "${p.description}" (quedan ${p.stock})`)
      }
      const number = 'PED-' + String(db.seq++).padStart(6, '0')
      const items = input.items.map(it => ({ ...it, price: db.products.find(p => p.code === it.code)!.price })) // el precio siempre sale del catálogo
      const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
      const shipping = shippingFor(subtotal, input.delivery, input.city)
      const order: Order = { ...input, userId, items, number, date: new Date().toISOString(), status: 'Pendiente', subtotal, shipping, total: subtotal + shipping }
      items.forEach((it, n) => {
        db.products.find(p => p.code === it.code)!.stock -= it.qty
        db.sales.unshift({ id: `${number}-${n + 1}`, date: today(), docRef: number, code: it.code, description: it.description, qty: it.qty, price: it.price, amount: it.price * it.qty, channel: 'Tienda', status: 'Emitida' })
      })
      // El cliente se registra automáticamente si no existe
      if (!db.clients.some(c => c.doc === input.doc))
        db.clients.unshift({ code: String(db.clients.length + 1 + Math.floor(Math.random() * 1e4)).padStart(8, '0'), name: input.name, doc: input.doc, address: input.address, city: input.city, phone: input.phone, email: input.email, active: true })
      db.orders.unshift(order)
      return ok(order)
    })
  },

  async setStatus(number, status) {
    mutate(db => {
      const o = db.orders.find(x => x.number === number)
      if (!o || o.status === status) return
      const wasCancelled = o.status === 'Cancelado'
      if (status === 'Cancelado') { // devuelve stock y anula ventas
        o.items.forEach(it => { const p = db.products.find(x => x.code === it.code); if (p) p.stock += it.qty })
        db.sales.filter(s => s.docRef === number).forEach(s => { s.status = 'Anulada' })
      } else if (wasCancelled) { // reactivar: vuelve a descontar
        o.items.forEach(it => { const p = db.products.find(x => x.code === it.code); if (p) p.stock = Math.max(0, p.stock - it.qty) })
        db.sales.filter(s => s.docRef === number).forEach(s => { s.status = 'Emitida' })
      }
      o.status = status
    })
    return ok()
  },
}

export const localSales: SalesService = {
  async list() { return read().sales },
  async counterSale(code, qty) {
    return mutate(db => {
      const p = db.products.find(x => x.code === code)
      if (!p) return fail('Producto no encontrado')
      if (qty < 1 || p.stock < qty) return fail(`Stock insuficiente (quedan ${p.stock})`)
      p.stock -= qty
      db.sales.unshift({ id: 'MOS-' + String(db.seq++).padStart(6, '0'), date: today(), docRef: 'Mostrador', code, description: p.description, qty, price: p.price, amount: p.price * qty, channel: 'Mostrador', status: 'Emitida' })
      return ok()
    })
  },
}
