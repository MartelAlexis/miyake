import type { Client, Product } from './types'

/* Reglas de negocio que la UI necesita para mostrar totales antes de confirmar.
   OJO: con backend, el servidor DEBE recalcular precios y envío; esto es solo vista previa. */
export function shippingFor(subtotal: number, delivery: string, city: string) {
  if (delivery === 'Recojo' || subtotal >= 500) return 0
  return city.trim().toLowerCase() === 'lima' ? 12 : 25
}

/* Sugerencia de código para formularios nuevos. Si el backend genera los códigos,
   basta con enviar code vacío y usar el que devuelva. */
export const suggestProductCode = (products: Product[]) =>
  String(Math.max(0, ...products.map(p => Number(p.code) || 0)) + 1).padStart(6, '0')
export const suggestClientCode = (clients: Client[]) =>
  String(Math.max(0, ...clients.map(c => Number(c.code) || 0)) + 1).padStart(8, '0')
