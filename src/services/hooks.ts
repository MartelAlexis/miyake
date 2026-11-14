import { useQuery } from '@/core/query'
import type { Client, Order, Product, Sale } from '@/core/types'
import { services } from '.'

/* Hooks de lectura que usa la UI. Las claves permiten refrescar por prefijo (ver services/index.ts). */
const EMPTY: unknown[] = []
const none = <T,>() => EMPTY as T[]

export const useProducts = (publishedOnly = false) =>
  useQuery(publishedOnly ? 'products:public' : 'products', () => services.catalog.list({ publishedOnly }), none<Product>())
export const useClients = () => useQuery('clients', services.clients.list, none<Client>())
export const useOrders = () => useQuery('orders', services.orders.list, none<Order>())
export const useSales = () => useQuery('sales', services.sales.list, none<Sale>())
export const useOrder = (number: string) =>
  useQuery<Order | null>('orders:one:' + number, () => services.orders.getByNumber(number), null)
export const useMyOrders = (userId: string) => useQuery('orders:mine:' + userId, services.orders.listMine, none<Order>())
