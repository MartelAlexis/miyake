import { config } from '@/core/config'
import { http } from '@/core/http'
import { getSession } from '@/core/session'
import { ok } from '@/core/result'
import type { Claim, Client, Order, Product, Sale, Session, User } from '@/core/types'
import type { Services } from '../contracts'
import { attempt } from './util'

/* Implementación contra un backend REST. Los endpoints esperados están documentados en docs/API.md.
   Si tu backend usa otras rutas o formas de respuesta, este es el ÚNICO archivo que debes adaptar. */
export const apiServices: Services = {
  auth: {
    login: (email, password) => attempt(async () => ok(await http<Session>('/auth/login', { method: 'POST', body: { email, password } }))),
    register: input => attempt(async () => ok(await http<Session>('/auth/register', { method: 'POST', body: input }))),
    updateProfile: input => attempt(async () => ok(await http<User>('/auth/me', { method: 'PUT', body: input }))),
    logout: async () => { try { await http('/auth/logout', { method: 'POST' }) } catch { /* igual se cierra la sesión local */ } },
  },
  catalog: {
    list: ({ publishedOnly = false } = {}) => http<Product[]>(`/products${publishedOnly ? '?published=true' : ''}`),
    save: (p, isNew) => attempt(async () => { await (isNew ? http('/products', { method: 'POST', body: p }) : http(`/products/${encodeURIComponent(p.code)}`, { method: 'PUT', body: p })); return ok() }),
    remove: code => attempt(async () => { await http(`/products/${encodeURIComponent(code)}`, { method: 'DELETE' }); return ok() }),
  },
  clients: {
    list: () => http<Client[]>('/clients'),
    save: (c, isNew) => attempt(async () => { await (isNew ? http('/clients', { method: 'POST', body: c }) : http(`/clients/${encodeURIComponent(c.code)}`, { method: 'PUT', body: c })); return ok() }),
    remove: code => attempt(async () => { await http(`/clients/${encodeURIComponent(code)}`, { method: 'DELETE' }); return ok() }),
  },
  orders: {
    list: () => http<Order[]>('/orders'),
    listMine: () => http<Order[]>('/orders/mine'),
    getByNumber: async number => { try { return await http<Order>(`/orders/${encodeURIComponent(number)}`) } catch { return null } },
    place: input => attempt(async () => ok(await http<Order>('/orders', { method: 'POST', body: input }))),
    setStatus: (number, status) => attempt(async () => { await http(`/orders/${encodeURIComponent(number)}/status`, { method: 'PATCH', body: { status } }); return ok() }),
  },
  sales: {
    list: () => http<Sale[]>('/sales'),
    counterSale: (code, qty) => attempt(async () => { await http('/sales/counter', { method: 'POST', body: { code, qty } }); return ok() }),
    exportDataset: async () => {
      const res = await fetch(config.apiUrl + '/exports/ventas-detalle.csv', { headers: { Authorization: `Bearer ${getSession()?.token ?? ''}` } })
      if (!res.ok) throw new Error('No se pudo exportar el dataset')
      return res.text()
    },
  },
  claims: {
    create: input => attempt(async () => ok(await http<Claim>('/claims', { method: 'POST', body: input }))),
    list: () => http<Claim[]>('/claims'),
    respond: (number, response) => attempt(async () => { await http(`/claims/${encodeURIComponent(number)}`, { method: 'PATCH', body: { response } }); return ok() }),
  },
}
