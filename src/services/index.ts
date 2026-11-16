import { config } from '@/core/config'
import { invalidate } from '@/core/query'
import type { Result } from '@/core/result'
import type { Services } from './contracts'
import { apiServices } from './api'
import { localServices } from './local'

const base: Services = config.dataSource === 'api' ? apiServices : localServices

/* Tras cada operación de escritura exitosa se refrescan las consultas afectadas.
   Así la UI nunca necesita saber qué implementación hay debajo. */
const after = <A extends unknown[], T>(fn: (...a: A) => Promise<Result<T>>, ...keys: string[]) =>
  async (...a: A) => { const r = await fn(...a); if (r.ok) invalidate(...keys); return r }

export const services: Services = {
  ...base,
  catalog: { ...base.catalog, save: after(base.catalog.save, 'products'), remove: after(base.catalog.remove, 'products') },
  clients: { ...base.clients, save: after(base.clients.save, 'clients'), remove: after(base.clients.remove, 'clients') },
  orders: {
    ...base.orders,
    place: after(base.orders.place, 'orders', 'products', 'sales', 'clients'),
    setStatus: after(base.orders.setStatus, 'orders', 'products', 'sales'),
  },
  claims: { ...base.claims, create: after(base.claims.create, 'claims'), respond: after(base.claims.respond, 'claims') },
  sales: { ...base.sales, counterSale: after(base.sales.counterSale, 'sales', 'products') },
}
export type { Services } from './contracts'
