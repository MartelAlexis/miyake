import type { Services } from '../contracts'
import { localAuth } from './auth'
import { localCatalog } from './catalog'
import { localClients } from './clients'
import { localOrders, localSales } from './orders'
import { resetDB } from './storage'

export const localServices: Services = {
  auth: localAuth,
  catalog: localCatalog,
  clients: localClients,
  orders: localOrders,
  sales: localSales,
  resetDemo: async () => resetDB(),
}
