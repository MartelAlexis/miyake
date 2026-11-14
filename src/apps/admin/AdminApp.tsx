import { useState } from 'react'
import { config } from '@/core/config'
import { Icon } from '@/shared/components/Icon'
import { useToast } from '@/shared/components/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { can, roleLabel } from '@/features/auth/permissions'
import { services } from '@/services'
import { useOrders } from '@/services/hooks'
import { navItems, type Page } from './nav'
import { inbound, outbound } from './mock/data'
import { Dashboard } from './pages/Dashboard'
import { Orders } from './pages/Orders'
import { Sales } from './pages/Sales'
import { Products } from './pages/Products'
import { Clients } from './pages/Clients'
import { Stock } from './pages/Stock'
import { Cash } from './pages/Cash'
import { Periods } from './pages/Periods'
import { MovementMenu } from './pages/Movements'

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function AdminApp() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [sidebar, setSidebar] = useState(true)
  const [search, setSearch] = useState('')
  const { notify, toast } = useToast()
  const pending = useOrders().data.filter(o => o.status === 'Pendiente').length

  if (!user) return null // RequireAuth ya lo cubre; esto solo satisface a TypeScript
  const items = navItems.filter(i => can(user.role, i.id))
  const pageInfo = navItems.find(i => i.id === page)!
  const nav = (p: Page) => { if (!can(user.role, p)) return notify('No tienes permiso para esta sección'); setPage(p); setSearch('') }
  const common = { search, setSearch, notify, exitTo: () => nav('dashboard') }

  return <div className={`app ${sidebar ? '' : 'collapsed'}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">M</div><div><b>Miyake</b><span>GESTIÓN COMERCIAL</span></div></div>
      <nav>{items.map(i => <button key={i.id} className={page === i.id ? 'active' : ''} onClick={() => nav(i.id)}><Icon name={i.icon} /><span>{i.label}</span></button>)}</nav>
      <div className="sidebar-user"><div className="avatar">{initials(user.name)}</div><div><b>{user.name}</b><span>{roleLabel[user.role]}</span></div></div>
    </aside>
    <main>
      <header>
        <div className="header-left"><button className="icon-button" onClick={() => setSidebar(!sidebar)}><Icon name="menu" /></button><div className="breadcrumb"><span>Miyake</span><Icon name="chevron" size={14} /><b>{pageInfo.label}</b></div></div>
        <div className="header-right">
          <a className="btn" href="/" target="_blank" rel="noreferrer"><Icon name="eye" /> Ver tienda</a>
          {services.resetDemo && config.dataSource === 'local' && can(user.role, 'productos') &&
            <button className="btn" onClick={async () => { if (confirm('¿Restablecer todos los datos de ejemplo? Se perderán pedidos, ventas y cambios.')) { await services.resetDemo!(); notify('Datos restablecidos') } }}><Icon name="refresh" /> Restablecer demo</button>}
          <button className="icon-button" aria-label="Pedidos pendientes" onClick={() => nav('pedidos')}><Icon name="bell" />{pending > 0 && <i>{pending}</i>}</button>
          <button className="btn" onClick={() => logout()}><Icon name="arrow-out" /> Cerrar sesión</button>
          <div className="avatar" title={user.email}>{initials(user.name)}</div>
        </div>
      </header>
      <section className="content">
        <div className="page-heading"><div><p>GESTIÓN COMERCIAL</p><h1>{pageInfo.label}</h1></div></div>
        {page === 'dashboard' && <Dashboard go={nav} />}
        {page === 'pedidos' && <Orders {...common} />}
        {page === 'ventas' && <Sales {...common} />}
        {page === 'productos' && <Products {...common} />}
        {page === 'clientes' && <Clients {...common} />}
        {page === 'stock' && <Stock {...common} />}
        {page === 'caja' && <Cash search={search} setSearch={setSearch} notify={notify} />}
        {page === 'periodos' && <Periods search={search} setSearch={setSearch} notify={notify} />}
        {page === 'ingresos' && <MovementMenu items={inbound} type="Ingreso" notify={notify} />}
        {page === 'salidas' && <MovementMenu items={outbound} type="Salida" notify={notify} />}
      </section>
    </main>
    {toast}
  </div>
}
