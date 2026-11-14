import type { AdminPage } from '@/features/auth/permissions'
import type { IconName } from '@/shared/components/Icon'

export type Page = AdminPage
export type PageProps = { search: string; setSearch: (v: string) => void; notify: (s: string) => void; exitTo: () => void }

export const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Inicio', icon: 'grid' },
  { id: 'pedidos', label: 'Pedidos de la tienda', icon: 'cart' },
  { id: 'ventas', label: 'Consulta ventas', icon: 'chart' },
  { id: 'productos', label: 'Productos', icon: 'box' },
  { id: 'clientes', label: 'Clientes', icon: 'users' },
  { id: 'caja', label: 'Registro de caja', icon: 'wallet' },
  { id: 'periodos', label: 'Periodos de ventas', icon: 'calendar' },
  { id: 'stock', label: 'Stock valorizado', icon: 'layers' },
  { id: 'ingresos', label: 'Ingresos almacén', icon: 'arrow-in' },
  { id: 'salidas', label: 'Salidas almacén', icon: 'arrow-out' },
]
