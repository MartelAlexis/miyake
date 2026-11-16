import type { Services } from '../contracts'
import { localAuth } from './auth'
import { localCatalog } from './catalog'
import { localClaims } from './claims'
import { localClients } from './clients'
import { localOrders, localSales } from './orders'
import { resetDB } from './storage'

export const localServices: Services = {
  auth: localAuth,
  catalog: localCatalog,
  clients: localClients,
  orders: localOrders,
  sales: localSales,
  claims: localClaims,
  resetDemo: async () => resetDB(),
}
