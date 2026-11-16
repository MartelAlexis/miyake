import type { Role } from '@/core/types'

/* Qué secciones del admin puede ver cada rol. El backend debe validar lo mismo en cada endpoint:
   ocultar un menú en la UI nunca es seguridad por sí solo. */
export type AdminPage = 'dashboard' | 'pedidos' | 'ventas' | 'productos' | 'clientes' | 'caja' | 'periodos' | 'stock' | 'ingresos' | 'salidas' | 'reclamos'

const ALL: AdminPage[] = ['dashboard', 'pedidos', 'ventas', 'productos', 'clientes', 'caja', 'periodos', 'stock', 'ingresos', 'salidas', 'reclamos']
const access: Record<Role, AdminPage[]> = {
  admin: ALL,
  cajero: ['dashboard', 'pedidos', 'ventas', 'caja', 'periodos', 'stock'],
  cliente: [], // los clientes no entran al panel
}

export const can = (role: Role, page: AdminPage) => access[role].includes(page)
export const roleLabel: Record<Role, string> = { admin: 'Administrador', cajero: 'Cajero', cliente: 'Cliente' }
export const isStaff = (role: Role) => role !== 'cliente'
