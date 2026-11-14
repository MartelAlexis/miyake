import { money, today } from '@/core/format'
import { Icon, type IconName } from '@/shared/components/Icon'
import { useAuth } from '@/features/auth/AuthProvider'
import { can } from '@/features/auth/permissions'
import { useClients, useOrders, useProducts, useSales } from '@/services/hooks'
import type { Page } from '../nav'
import { Status } from '../components/ui'

export function Dashboard({ go }: { go: (p: Page) => void }) {
  const { user } = useAuth()
  const sales = useSales().data, orders = useOrders().data, products = useProducts().data, clients = useClients().data
  const valid = sales.filter(s => s.status === 'Emitida')
  const todayTotal = valid.filter(s => s.date === today()).reduce((a, s) => a + s.amount, 0)
  const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10); return { d, v: valid.filter(s => s.date === d).reduce((a, s) => a + s.amount, 0) } })
  const max = Math.max(1, ...days.map(d => d.v))
  const low = products.filter(p => p.stock <= 5)
  const cards: [string, string, IconName, Page][] = [
    ['Ventas de hoy', money(todayTotal), 'chart', 'ventas'],
    ['Pedidos pendientes', String(orders.filter(o => o.status === 'Pendiente').length), 'cart', 'pedidos'],
    ['Productos', String(products.length), 'box', 'productos'],
    ['Clientes', String(clients.length), 'users', 'clientes'],
  ]
  return <>
    <div className="metric-grid">{cards.filter(c => can(user!.role, c[3])).map(([l, v, i, p]) => <div className="metric-card" key={l} onClick={() => go(p)} style={{ cursor: 'pointer' }}><div className="metric-icon blue"><Icon name={i} /></div><div className="metric-copy"><span>{l}</span><strong>{v}</strong></div></div>)}</div>
    <div className="dashboard-grid">
      <div className="panel"><div className="panel-head"><div><h3>Ventas últimos 7 días</h3><p>Solo ventas emitidas</p></div></div>
        <svg viewBox="0 0 350 160" style={{ width: '100%', padding: 20 }}>{days.map((d, i) => <g key={d.d}><rect x={i * 50 + 8} y={130 - (d.v / max) * 110} width="32" height={(d.v / max) * 110} rx="4" fill="#2767ef" /><text x={i * 50 + 24} y="150" fontSize="9" textAnchor="middle" fill="#9ba5b6">{d.d.slice(5)}</text><text x={i * 50 + 24} y={124 - (d.v / max) * 110} fontSize="8" textAnchor="middle" fill="#657189">{d.v ? Math.round(d.v) : ''}</text></g>)}</svg></div>
      <div className="panel"><div className="panel-head"><div><h3>Stock bajo</h3><p>5 unidades o menos</p></div></div>
        <div style={{ padding: 14, display: 'grid', gap: 8, fontSize: 11 }}>{low.length === 0 && <span>Todo el stock está en orden.</span>}{low.map(p => <div key={p.code} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{p.description}</span><Status green={p.stock > 0}>{p.stock}</Status></div>)}</div></div>
    </div>
  </>
}
