import { useSyncExternalStore } from 'react'

/* Base de datos local compartida (localStorage). La tienda y el admin leen y
   escriben aquí, así un pedido hecho en la tienda aparece en el admin. */

export type Product = { code: string; description: string; model: string; family: string; brand: string; stock: number; unit: string; cost: number; price: number; oldPrice: number; rating: number; image: string; published: boolean }
export type Client = { code: string; name: string; doc: string; address: string; city: string; phone: string; email: string; active: boolean }
export type OrderItem = { code: string; description: string; qty: number; price: number }
export type OrderStatus = 'Pendiente' | 'Confirmado' | 'Enviado' | 'Entregado' | 'Cancelado'
export type Order = { number: string; date: string; name: string; doc: string; phone: string; email: string; delivery: 'Recojo' | 'Despacho'; address: string; city: string; payment: string; items: OrderItem[]; subtotal: number; shipping: number; total: number; status: OrderStatus }
export type Sale = { id: string; date: string; docRef: string; code: string; description: string; qty: number; price: number; amount: number; channel: 'Tienda' | 'Mostrador'; status: 'Emitida' | 'Anulada' }
export type DB = { products: Product[]; clients: Client[]; orders: Order[]; sales: Sale[]; seq: number }

const KEY = 'gescom:db:v1'
export const today = () => new Date().toISOString().slice(0, 10)
export const money = (n: number) => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f1f3ef'/><text x='50%' y='50%' fill='%23a1aaa3' font-family='sans-serif' font-size='16' text-anchor='middle'>Sin imagen</text></svg>"

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`
const P = (code: string, description: string, model: string, family: string, brand: string, stock: number, price: number, oldPrice: number, rating: number, image: string): Product =>
  ({ code, description, model, family, brand, stock, unit: 'UND', cost: Math.round(price * 0.7 * 100) / 100, price, oldPrice, rating, image: img(image), published: true })

function seed(): DB {
  const products = [
    P('000359', 'Tinta Epson 101 Black', 'IMP780', 'Suministros', 'EPSON', 30, 39.9, 49.9, 4.8, 'photo-1612815154858-60aa4c59eaa6'),
    P('000830', 'Kit de tinta Epson 101', 'MU420', 'Suministros', 'EPSON', 20, 68, 79.9, 4.9, 'photo-1562408590-e32931084e23'),
    P('000361', 'Impresora térmica POS 80 mm', 'IMP780', 'Impresoras', 'MIYAKE', 12, 249, 289, 4.7, 'photo-1612815154858-60aa4c59eaa6'),
    P('000362', 'Lector de código de barras USB', 'SC103', 'Lectores', 'MIYAKE', 17, 145, 169, 4.6, 'photo-1556742049-0cfed4f6a45d'),
    P('000397', 'Balanza digital comercial 30 kg', 'MU420', 'Balanzas', 'CAS', 6, 548.8, 599, 4.9, 'photo-1587825140708-dfaf72ae4b04'),
    P('000398', 'Gaveta de dinero metálica', 'CD105', 'Punto de venta', 'MIYAKE', 8, 189, 219, 4.5, 'photo-1556742044-3c52d6e88c62'),
    P('000363', 'Pack papel térmico 80 x 80', 'PT107', 'Suministros', 'GENÉRICO', 120, 56, 64, 4.8, 'photo-1586864387967-d02ef85d93e8'),
    P('000384', 'Terminal POS táctil compacto', 'POS108', 'Punto de venta', 'MIYAKE', 10, 1299, 1499, 4.9, 'photo-1556740758-90de374c12ad'),
  ]
  const C = (code: string, name: string, doc: string, address: string, city: string): Client => ({ code, name, doc, address, city, phone: '', email: '', active: true })
  const clients = [
    C('00005635', 'HIT HARDWARE & SOFTWARE E.I.R.L.', '20628015481', 'AV. PRADO NRO. 224 URB. PUEBLO LIBRE', 'ABANCAY'),
    C('00005402', '1B Y 5 S.A.C.', '20604225303', 'CAL. TRINIDAD CELIS NRO. 1575', 'LIMA'),
    C('00001895', 'ARH SANDWICHONE E.I.R.L.', '20536202138', 'JR. SAN MARTIN 17A D. LOTE 15', 'CHICLAYO'),
    C('00005542', '2F2 S.A.C.', '20608967215', 'AV. ALAMIRANTE 2262', 'SAN MIGUEL'),
    C('00004482', '4ARK S.A.C.', '20603882096', 'JR. PARACAS NRO. 555', 'PUEBLO LIBRE'),
  ]
  return { products, clients, orders: [], sales: [], seq: 1 }
}

let cache: { raw: string; db: DB } | null = null
const subs = new Set<() => void>()

function read(): DB {
  let raw = localStorage.getItem(KEY)
  if (!raw) { raw = JSON.stringify(seed()); localStorage.setItem(KEY, raw) }
  if (!cache || cache.raw !== raw) cache = { raw, db: JSON.parse(raw) as DB }
  return cache.db
}
function commit(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db))
  subs.forEach(f => f())
}
function subscribe(f: () => void) {
  subs.add(f)
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) f() } // sincroniza pestañas
  window.addEventListener('storage', onStorage)
  return () => { subs.delete(f); window.removeEventListener('storage', onStorage) }
}
export const useDB = () => useSyncExternalStore(subscribe, read)
export const getDB = read
export function resetDB() { localStorage.removeItem(KEY); subs.forEach(f => f()) }

function mutate<T>(fn: (db: DB) => T): T {
  const db: DB = JSON.parse(JSON.stringify(read()))
  const out = fn(db)
  commit(db)
  return out
}

/* ---------- Productos ---------- */
export function saveProduct(p: Product, isNew: boolean): string | null {
  return mutate(db => {
    const i = db.products.findIndex(x => x.code === p.code)
    if (isNew && i >= 0) return 'Ya existe un producto con ese código'
    if (isNew) db.products.unshift(p); else if (i >= 0) db.products[i] = p
    return null
  })
}
export const deleteProduct = (code: string) => mutate(db => { db.products = db.products.filter(p => p.code !== code) })
export function nextCode(db: DB) { return String(Math.max(0, ...db.products.map(p => Number(p.code) || 0)) + 1).padStart(6, '0') }

/* ---------- Clientes ---------- */
export function saveClient(c: Client, isNew: boolean): string | null {
  return mutate(db => {
    const i = db.clients.findIndex(x => x.code === c.code)
    if (isNew && i >= 0) return 'Ya existe un cliente con ese código'
    if (isNew) db.clients.unshift(c); else if (i >= 0) db.clients[i] = c
    return null
  })
}
export const deleteClient = (code: string) => mutate(db => { db.clients = db.clients.filter(c => c.code !== code) })
export function nextClientCode(db: DB) { return String(Math.max(0, ...db.clients.map(c => Number(c.code) || 0)) + 1).padStart(8, '0') }

/* ---------- Pedidos / ventas ---------- */
export type OrderInput = Omit<Order, 'number' | 'date' | 'status' | 'subtotal' | 'shipping' | 'total'>
export function shippingFor(subtotal: number, delivery: string, city: string) {
  if (delivery === 'Recojo' || subtotal >= 500) return 0
  return city.trim().toLowerCase() === 'lima' ? 12 : 25
}

export function placeOrder(input: OrderInput): { ok: true; order: Order } | { ok: false; error: string } {
  return mutate(db => {
    for (const it of input.items) {
      const p = db.products.find(x => x.code === it.code)
      if (!p) return { ok: false as const, error: `"${it.description}" ya no está disponible` }
      if (p.stock < it.qty) return { ok: false as const, error: `Stock insuficiente de "${p.description}" (quedan ${p.stock})` }
    }
    const number = 'PED-' + String(db.seq++).padStart(6, '0')
    const items = input.items.map(it => ({ ...it, price: db.products.find(p => p.code === it.code)!.price }))
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
    const shipping = shippingFor(subtotal, input.delivery, input.city)
    const order: Order = { ...input, items, number, date: new Date().toISOString(), status: 'Pendiente', subtotal, shipping, total: subtotal + shipping }
    items.forEach((it, n) => {
      db.products.find(p => p.code === it.code)!.stock -= it.qty
      db.sales.unshift({ id: `${number}-${n + 1}`, date: today(), docRef: number, code: it.code, description: it.description, qty: it.qty, price: it.price, amount: it.price * it.qty, channel: 'Tienda', status: 'Emitida' })
    })
    // El cliente se registra (o actualiza) automáticamente
    if (!db.clients.some(c => c.doc === input.doc))
      db.clients.unshift({ code: String(db.clients.length + 1 + Math.floor(Math.random() * 1e4)).padStart(8, '0'), name: input.name, doc: input.doc, address: input.address, city: input.city, phone: input.phone, email: input.email, active: true })
    db.orders.unshift(order)
    return { ok: true as const, order }
  })
}

export function setOrderStatus(number: string, status: OrderStatus) {
  mutate(db => {
    const o = db.orders.find(x => x.number === number)
    if (!o || o.status === status) return
    const wasCancelled = o.status === 'Cancelado'
    if (status === 'Cancelado') {            // devuelve stock y anula ventas
      o.items.forEach(it => { const p = db.products.find(x => x.code === it.code); if (p) p.stock += it.qty })
      db.sales.filter(s => s.docRef === number).forEach(s => { s.status = 'Anulada' })
    } else if (wasCancelled) {                // reactivar: vuelve a descontar
      o.items.forEach(it => { const p = db.products.find(x => x.code === it.code); if (p) p.stock = Math.max(0, p.stock - it.qty) })
      db.sales.filter(s => s.docRef === number).forEach(s => { s.status = 'Emitida' })
    }
    o.status = status
  })
}

/* ---------- Venta de mostrador (admin) ---------- */
export function counterSale(code: string, qty: number): string | null {
  return mutate(db => {
    const p = db.products.find(x => x.code === code)
    if (!p) return 'Producto no encontrado'
    if (qty < 1 || p.stock < qty) return `Stock insuficiente (quedan ${p.stock})`
    p.stock -= qty
    db.sales.unshift({ id: 'MOS-' + String(db.seq++).padStart(6, '0'), date: today(), docRef: 'Mostrador', code, description: p.description, qty, price: p.price, amount: p.price * qty, channel: 'Mostrador', status: 'Emitida' })
    return null
  })
}
