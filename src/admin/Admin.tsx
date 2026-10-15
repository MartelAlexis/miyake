import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../shared/Icon'
import { PLACEHOLDER, counterSale, deleteClient, deleteProduct, getDB, money, nextClientCode, nextCode, resetDB, saveClient, saveProduct, setOrderStatus, today, useDB, type Client, type Order, type OrderStatus, type Product } from '../shared/db'

type Page = 'dashboard' | 'pedidos' | 'ventas' | 'productos' | 'clientes' | 'caja' | 'periodos' | 'stock' | 'ingresos' | 'salidas'
type CommonProps = { search: string; setSearch: (v: string) => void; exportCsv: () => void; notify: (s: string) => void }

const navItems: { id: Page; label: string; icon: IconName }[] = [
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

const periods = [
  ['Sábado', '26-09-2026', 'Abierto', 'ARACELI', '13,231.50', 'PUEBLO LIBRE'],
  ['Viernes', '25-09-2026', 'Cerrado', 'ARACELI', '13,316.50', 'PUEBLO LIBRE'],
  ['Jueves', '24-09-2026', 'Cerrado', 'ALOPEZ', '13,219.50', 'PUEBLO LIBRE'],
  ['Miércoles', '23-09-2026', 'Cerrado', 'ARACELI', '13,550.50', 'PUEBLO LIBRE'],
  ['Martes', '22-09-2026', 'Cerrado', 'ARACELI', '14,291.50', 'PUEBLO LIBRE'],
  ['Lunes', '21-09-2026', 'Cerrado', 'CCHUGNAS', '13,054.50', 'PUEBLO LIBRE'],
  ['Sábado', '19-09-2026', 'Cerrado', 'CCHUGNAS', '13,054.50', 'PUEBLO LIBRE'],
]

const inbound = ['Órdenes de compra', 'Producción', 'Importaciones', 'Transferencia entre almacén de la empresa', 'Anulación o devolución de venta - Nota de crédito', 'Cambio de mercadería en la venta', 'Recuperación propia (recogido)', 'Retiro por demostración al cliente', 'Bonificación en la compra', 'Devolución de mercadería al proveedor', 'Compras locales (sin orden de compra)', 'Ajuste de inventario']
const outbound = ['Ventas de mercadería', 'Producción consumo de insumos', 'Transferencia entre almacén de la empresa', 'Cambio de mercadería a la venta', 'Donación al cliente', 'Demostración al cliente', 'Consignación del proveedor', 'Devolución de mercadería al proveedor', 'Ajuste de inventario', 'Merma de producción']

const toolbarOptions = {
  ventas: ['Nueva venta', 'Exportar', 'Imprimir', 'Salir'],
  productos: ['Nuevo', 'Refrescar', 'Exportar', 'Imprimir', 'Cerrar'],
  clientes: ['Nuevo', 'Refrescar', 'Exportar', 'Imprimir', 'Cerrar'],
  caja: ['Ingresos', 'Egresos', 'Cuadre', 'Refrescar', 'Filtros', 'Diseñar', 'Imprimir', 'Exportar', 'Cerrar'],
  periodos: ['Nueva fecha', 'Reabrir', 'Cerrar', 'Refrescar', 'Imprimir', 'Salir'],
  stock: ['Exportar', 'Imprimir', 'Salir'],
}

function actionIcon(label: string): IconName {
  if (['Nuevo', 'Nueva fecha', 'Nueva venta', 'Ingresos'].includes(label)) return 'plus'
  if (['Editar', 'Diseñar'].includes(label)) return 'edit'
  if (['Eliminar', 'Egresos'].includes(label)) return 'trash'
  if (label === 'Exportar') return 'download'
  if (['Imprimir', 'BarCode'].includes(label)) return 'printer'
  if (['Filtros', 'Filtrar'].includes(label)) return 'filter'
  if (['Refrescar', 'Reabrir'].includes(label)) return 'refresh'
  if (['Cerrar', 'Salir'].includes(label)) return 'close'
  if (['Graficar', 'Cuadre'].includes(label)) return 'chart'
  if (label === 'Imagen') return 'eye'
  return 'layers'
}

function Toolbar({ variant, onAdd, onExit, onExport, search, setSearch, notify }: { onExit?: () => void; variant: keyof typeof toolbarOptions; onAdd?: () => void; onExport: () => void; search: string; setSearch: (v: string) => void; notify: (s: string) => void }) {
  const run = (label: string) => {
    if (['Nuevo', 'Nueva fecha', 'Nueva venta'].includes(label)) return onAdd?.()
    if (['Cerrar', 'Salir'].includes(label) && onExit) return onExit()
    if (label === 'Exportar') return onExport()
    if (label === 'Imprimir') return window.print()
    if (label === 'Refrescar') { setSearch(''); return notify('Información actualizada') }
    notify(`${label}: opción activada`)
  }
  return <div className="toolbar">
    <div className="toolbar-actions">
      {toolbarOptions[variant].map((label, index) => <button key={label} className={`btn ${index === 0 && ['productos','clientes','caja','periodos','ventas'].includes(variant) ? 'btn-primary' : ''}`} onClick={() => run(label)}><Icon name={actionIcon(label)}/>{label}</button>)}
    </div>
    <label className="search"><Icon name="search"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en registros..."/></label>
  </div>
}

function DataTable({ children }: { children: ReactNode }) {
  return <div className="table-wrap"><table>{children}</table></div>
}

function Status({ children, green = false }: { children: ReactNode; green?: boolean }) {
  return <span className={`status ${green ? 'green' : ''}`}>{children}</span>
}


function Cash({ search, setSearch, exportCsv, notify }: CommonProps) {
  return <><section className="panel"><Toolbar variant="caja" search={search} setSearch={setSearch} onExport={exportCsv} notify={notify}/><div className="filter-row"><label>Cajero <select><option>011 · Chugnas Lupuche Carlos</option></select></label><label>Desde <input type="date" defaultValue="2026-09-26"/></label><label>Hasta <input type="date" defaultValue="2026-09-26"/></label></div>
    <DataTable><thead><tr><th>Estado</th><th>Transacción</th><th>Fecha</th><th>Medio de pago</th><th>Referencia</th><th>Entidad</th><th className="right">Ingreso</th><th className="right">Egreso</th><th>Glosa</th></tr></thead><tbody><tr><td><Status green>Aprobado</Status></td><td><b>RI 001-0000024540</b></td><td>26-09-2026</td><td>EFECTIVO</td><td>DDE 001-0000022852</td><td>Ríos Ñahui Fortunato</td><td className="right positive">+ S/ 160.00</td><td className="right">S/ 0.00</td><td>FAC F01-0013189</td></tr></tbody></DataTable></section>
    <div className="cash-grid"><div className="panel balance"><span>Efectivo soles</span><strong>S/ 0.00</strong><small>Saldo final</small><button className="mini-btn" onClick={() => notify('Transacciones por hora')}>Ver transacciones por hora</button></div><div className="panel balance"><span>Efectivo dólares</span><strong>$ 160.00</strong><small>Saldo final</small><button className="mini-btn" onClick={() => notify('Entrega de efectivo')}>Entrega de efectivo</button></div><div className="panel balance totals"><span>Total de ingresos</span><strong>S/ 1,159.00</strong><small>Actualizado al cierre</small><button className="mini-btn dark" onClick={() => notify('Transferencia bancaria iniciada')}>Transferir a cuenta banco</button></div></div></>
}

function Periods({ search, setSearch, exportCsv, notify }: CommonProps) {
  const rows = periods.filter(r => r.join(' ').toLowerCase().includes(search.toLowerCase()))
  return <section className="panel"><Toolbar variant="periodos" search={search} setSearch={setSearch} onExport={exportCsv} onAdd={() => notify('Nueva fecha de sistema creada')} notify={notify}/>
    <div className="print-option"><label>Opciones de impresión <select onChange={() => notify('Opción de impresión seleccionada')}><option>Periodo venta</option><option>Resumen de cierre</option><option>Stock del periodo</option></select></label></div>
    <DataTable><thead><tr><th>Día</th><th>Fecha sistema</th><th>Fecha apertura</th><th>Estado</th><th>Usuario apertura</th><th>Válida</th><th className="right">Stock inicial</th><th>Almacén default</th><th>Acción</th></tr></thead><tbody>{rows.map(r => <tr key={r[1]}><td>{r[0]}</td><td><b>{r[1]}</b></td><td>{r[1]}</td><td><Status green={r[2] === 'Abierto'}>{r[2]}</Status></td><td>{r[3]}</td><td><Icon name="check"/></td><td className="right"><b>{r[4]}</b></td><td>{r[5]}</td><td><button className="mini-btn"><Icon name="printer" size={14}/> Imprimir</button></td></tr>)}</tbody></DataTable><TableFooter count={rows.length} total="Periodos registrados"/></section>
}

function MovementMenu({ items, type, notify }: { items: string[]; type: string; notify: (s:string) => void }) {
  return <section className="movement"><div className="movement-top"><button className="btn" onClick={() => notify('Menú cerrado')}><Icon name="close"/> Salir</button></div><div className="movement-intro"><h2>Selecciona un tipo de {type.toLowerCase()}</h2><p>Elige la operación que deseas registrar en el almacén Pueblo Libre.</p></div><div className="movement-grid">{items.map((item, i) => <button key={item} onClick={() => notify(`${item}: formulario listo para registrar`)}><span className={`movement-icon ${i % 4}`}><Icon name={type === 'Ingreso' ? 'arrow-in' : 'arrow-out'}/></span><div><b>{item}</b><small>Crear nuevo movimiento</small></div><span className="movement-arrow">→</span></button>)}<button className="exit-card" onClick={() => notify('Saliendo del menú')}><span className="movement-icon"><Icon name="close"/></span><div><b>Salir del menú</b><small>Volver al dashboard</small></div></button></div></section>
}




/* ---------- utilidades ---------- */
function downloadCsv(name: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  const csv = '\uFEFF' + [header, ...rows].map(r => r.map(esc).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `${name}-${today()}.csv`; a.click(); URL.revokeObjectURL(a.href)
}
const match = (row: unknown[], q: string) => row.join(' ').toLowerCase().includes(q.toLowerCase())

function TableFooter({ count, total }: { count: number; total: string }) {
  return <div className="table-footer"><span>Mostrando <b>{count}</b> registros</span><span>{total}</span></div>
}
function usePager<T>(rows: T[], size = 10) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const cur = Math.min(page, pages)
  const slice = rows.slice((cur - 1) * size, cur * size)
  const footer = (total: string) => <div className="table-footer"><span>Mostrando <b>{slice.length}</b> de {rows.length}</span><span>{total}</span>
    <div><button disabled={cur === 1} onClick={() => setPage(cur - 1)}>‹</button><button className="selected">{cur}/{pages}</button><button disabled={cur === pages} onClick={() => setPage(cur + 1)}>›</button></div></div>
  return { slice, footer }
}

function Modal({ title, kicker, onClose, onSave, saveLabel = 'Guardar', children }: { title: string; kicker: string; onClose: () => void; onSave: () => void; saveLabel?: string; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><div><small>{kicker}</small><h2>{title}</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div>
    <div className="form-grid">{children}</div>
    <div className="modal-foot"><button className="btn" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={onSave}><Icon name="check" /> {saveLabel}</button></div>
  </div></div>
}
const Field = ({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) => <label className={full ? 'full' : ''}><span>{label}</span>{children}</label>

/* ---------- App ---------- */
export default function Admin() {
  const db = useDB()
  const [page, setPage] = useState<Page>('dashboard')
  const [sidebar, setSidebar] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const pageInfo = navItems.find(i => i.id === page)!
  const pending = db.orders.filter(o => o.status === 'Pendiente').length
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400) }
  const nav = (p: Page) => { setPage(p); setSearch('') }
  const common = { search, setSearch, notify, exitTo: () => nav('dashboard') }

  return <div className={`app ${sidebar ? '' : 'collapsed'}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">M</div><div><b>Miyake</b><span>GESTIÓN COMERCIAL</span></div></div>
      <nav>{navItems.map(i => <button key={i.id} className={page === i.id ? 'active' : ''} onClick={() => nav(i.id)}><Icon name={i.icon} /><span>{i.label}</span></button>)}</nav>
      <div className="sidebar-user"><div className="avatar">CG</div><div><b>C. Chugnas</b><span>Administrador</span></div></div>
    </aside>
    <main>
      <header>
        <div className="header-left"><button className="icon-button" onClick={() => setSidebar(!sidebar)}><Icon name="menu" /></button><div className="breadcrumb"><span>Miyake</span><Icon name="chevron" size={14} /><b>{pageInfo.label}</b></div></div>
        <div className="header-right">
          <a className="btn" href="/" target="_blank" rel="noreferrer"><Icon name="eye" /> Ver tienda</a>
          <button className="btn" onClick={() => confirm('¿Restablecer todos los datos de ejemplo? Se perderán pedidos, ventas y cambios.') && (resetDB(), notify('Datos restablecidos'))}><Icon name="refresh" /> Restablecer demo</button>
          <button className="icon-button" aria-label="Pedidos pendientes" onClick={() => nav('pedidos')}><Icon name="bell" />{pending > 0 && <i>{pending}</i>}</button>
          <div className="avatar">CG</div>
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
        {page === 'caja' && <Cash search={search} setSearch={setSearch} exportCsv={() => notify('Sin datos reales de caja aún')} notify={notify} />}
        {page === 'periodos' && <Periods search={search} setSearch={setSearch} exportCsv={() => notify('Sin datos reales de periodos aún')} notify={notify} />}
        {page === 'ingresos' && <MovementMenu items={inbound} type="Ingreso" notify={notify} />}
        {page === 'salidas' && <MovementMenu items={outbound} type="Salida" notify={notify} />}
      </section>
    </main>
    {toast && <div className="toast"><Icon name="check" />{toast}</div>}
  </div>
}

type PageProps = { search: string; setSearch: (v: string) => void; notify: (s: string) => void; exitTo: () => void }

/* ---------- Dashboard con datos reales ---------- */
function Dashboard({ go }: { go: (p: Page) => void }) {
  const db = useDB()
  const valid = db.sales.filter(s => s.status === 'Emitida')
  const todayTotal = valid.filter(s => s.date === today()).reduce((a, s) => a + s.amount, 0)
  const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10); return { d, v: valid.filter(s => s.date === d).reduce((a, s) => a + s.amount, 0) } })
  const max = Math.max(1, ...days.map(d => d.v))
  const low = db.products.filter(p => p.stock <= 5)
  const cards: [string, string, IconName, Page][] = [['Ventas de hoy', money(todayTotal), 'chart', 'ventas'], ['Pedidos pendientes', String(db.orders.filter(o => o.status === 'Pendiente').length), 'cart', 'pedidos'], ['Productos', String(db.products.length), 'box', 'productos'], ['Clientes', String(db.clients.length), 'users', 'clientes']]
  return <>
    <div className="metric-grid">{cards.map(([l, v, i, p]) => <div className="metric-card" key={l} onClick={() => go(p)} style={{ cursor: 'pointer' }}><div className="metric-icon blue"><Icon name={i} /></div><div className="metric-copy"><span>{l}</span><strong>{v}</strong></div></div>)}</div>
    <div className="dashboard-grid">
      <div className="panel"><div className="panel-head"><div><h3>Ventas últimos 7 días</h3><p>Solo ventas emitidas</p></div></div>
        <svg viewBox="0 0 350 160" style={{ width: '100%', padding: 20 }}>{days.map((d, i) => <g key={d.d}><rect x={i * 50 + 8} y={130 - (d.v / max) * 110} width="32" height={(d.v / max) * 110} rx="4" fill="#2767ef" /><text x={i * 50 + 24} y="150" fontSize="9" textAnchor="middle" fill="#9ba5b6">{d.d.slice(5)}</text><text x={i * 50 + 24} y={124 - (d.v / max) * 110} fontSize="8" textAnchor="middle" fill="#657189">{d.v ? Math.round(d.v) : ''}</text></g>)}</svg></div>
      <div className="panel"><div className="panel-head"><div><h3>Stock bajo</h3><p>5 unidades o menos</p></div></div>
        <div style={{ padding: 14, display: 'grid', gap: 8, fontSize: 11 }}>{low.length === 0 && <span>Todo el stock está en orden.</span>}{low.map(p => <div key={p.code} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{p.description}</span><Status green={p.stock > 0}>{p.stock}</Status></div>)}</div></div>
    </div>
  </>
}

/* ---------- Pedidos ---------- */
const flow: OrderStatus[] = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado']
function Orders({ search, setSearch, notify }: PageProps) {
  const db = useDB()
  const [open, setOpen] = useState<Order | null>(null)
  const rows = db.orders.filter(o => match([o.number, o.name, o.doc, o.status, o.payment], search))
  const { slice, footer } = usePager(rows)
  const exportCsv = () => downloadCsv('pedidos', ['Pedido', 'Fecha', 'Cliente', 'Documento', 'Pago', 'Entrega', 'Total', 'Estado'], rows.map(o => [o.number, o.date.slice(0, 10), o.name, o.doc, o.payment, o.delivery, o.total.toFixed(2), o.status]))
  const current = open && db.orders.find(o => o.number === open.number)
  return <section className="panel"><Toolbar variant="stock" search={search} setSearch={setSearch} onExport={exportCsv} notify={notify} />
    <DataTable><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Entrega</th><th className="right">Total</th><th>Estado</th><th></th></tr></thead>
      <tbody>{slice.map(o => <tr key={o.number}><td><code>{o.number}</code></td><td>{o.date.slice(0, 10)}</td><td><b>{o.name}</b></td><td>{o.payment}</td><td>{o.delivery}</td><td className="right"><b>{money(o.total)}</b></td><td><Status green={o.status === 'Entregado'}>{o.status}</Status></td><td><button className="mini-btn" onClick={() => setOpen(o)}><Icon name="eye" size={14} /> Ver</button></td></tr>)}
        {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>Aún no hay pedidos. Haz una compra en la tienda y aparecerá aquí.</td></tr>}</tbody></DataTable>
    {footer(`${db.orders.length} pedidos`)}
    {current && <Modal kicker={current.number} title={current.name} onClose={() => setOpen(null)} onSave={() => setOpen(null)} saveLabel="Cerrar">
      <div className="full" style={{ fontSize: 12, lineHeight: 1.7 }}>
        <div>Doc: <b>{current.doc}</b> · Cel: <b>{current.phone}</b> · {current.email}</div><div>{current.delivery}: {current.address}{current.delivery === 'Despacho' ? `, ${current.city}` : ''}</div>
        <div style={{ margin: '10px 0' }}>{current.items.map(i => <div key={i.code}>{i.qty} × {i.description} — {money(i.qty * i.price)}</div>)}</div>
        <div>Envío: {money(current.shipping)} · <b>Total: {money(current.total)}</b> ({current.payment})</div></div>
      <Field label="Estado del pedido" full><select value={current.status} onChange={e => { setOrderStatus(current.number, e.target.value as OrderStatus); notify(`Pedido ${e.target.value.toLowerCase()}`) }}>{flow.map(s => <option key={s}>{s}</option>)}</select></Field>
      <span className="full" style={{ fontWeight: 400 }}>Cancelar un pedido devuelve el stock y anula sus ventas.</span>
    </Modal>}
  </section>
}

/* ---------- Ventas ---------- */
function Sales({ search, setSearch, notify, exitTo }: PageProps) {
  const db = useDB()
  const [from, setFrom] = useState(''), [to, setTo] = useState('')
  const [modal, setModal] = useState(false)
  const [sel, setSel] = useState({ code: '', qty: 1 })
  const rows = db.sales.filter(s => match([s.id, s.description, s.docRef, s.channel, s.code], search) && (!from || s.date >= from) && (!to || s.date <= to))
  const { slice, footer } = usePager(rows)
  const total = rows.filter(s => s.status === 'Emitida').reduce((a, s) => a + s.amount, 0)
  const exportCsv = () => downloadCsv('ventas', ['Documento', 'Fecha', 'Código', 'Descripción', 'Cantidad', 'Precio', 'Importe', 'Canal', 'Estado'], rows.map(s => [s.docRef, s.date, s.code, s.description, s.qty, s.price.toFixed(2), s.amount.toFixed(2), s.channel, s.status]))
  const save = () => { const e = counterSale(sel.code, sel.qty); if (e) return notify(e); setModal(false); notify('Venta registrada y stock actualizado') }
  return <section className="panel"><Toolbar variant="ventas" search={search} setSearch={setSearch} onExport={exportCsv} onAdd={() => { setSel({ code: db.products.find(p => p.stock > 0)?.code ?? '', qty: 1 }); setModal(true) }} onExit={exitTo} notify={notify} />
    <div className="filter-row"><label>Desde <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>Hasta <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label></div>
    <DataTable><thead><tr><th>Documento</th><th>Fecha</th><th>Código</th><th>Descripción</th><th className="right">Cant.</th><th className="right">Precio</th><th className="right">Importe</th><th>Canal</th><th>Estado</th></tr></thead>
      <tbody>{slice.map(s => <tr key={s.id} style={s.status === 'Anulada' ? { opacity: .5 } : undefined}><td><code>{s.docRef}</code></td><td>{s.date}</td><td>{s.code}</td><td><b>{s.description}</b></td><td className="right">{s.qty}</td><td className="right">{money(s.price)}</td><td className="right"><b>{money(s.amount)}</b></td><td>{s.channel}</td><td><Status green={s.status === 'Emitida'}>{s.status}</Status></td></tr>)}
        {rows.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40 }}>Sin ventas en este filtro.</td></tr>}</tbody></DataTable>
    {footer(`Total: ${money(total)}`)}
    {modal && <Modal kicker="VENTA DE MOSTRADOR" title="Nueva venta" onClose={() => setModal(false)} onSave={save}>
      <Field label="Producto" full><select value={sel.code} onChange={e => setSel({ ...sel, code: e.target.value })}>{db.products.map(p => <option key={p.code} value={p.code} disabled={p.stock < 1}>{p.description} — {money(p.price)} (stock {p.stock})</option>)}</select></Field>
      <Field label="Cantidad"><input type="number" min={1} value={sel.qty} onChange={e => setSel({ ...sel, qty: Number(e.target.value) })} /></Field></Modal>}
  </section>
}

/* ---------- Productos (CRUD) ---------- */
const blank = (code: string): Product => ({ code, description: '', model: '', family: 'Punto de venta', brand: '', stock: 0, unit: 'UND', cost: 0, price: 0, oldPrice: 0, rating: 4.5, image: '', published: true })
function Products({ search, setSearch, notify, exitTo }: PageProps) {
  const db = useDB()
  const [edit, setEdit] = useState<{ p: Product; isNew: boolean } | null>(null)
  const rows = db.products.filter(p => match(Object.values(p), search))
  const { slice, footer } = usePager(rows)
  const exportCsv = () => downloadCsv('productos', ['Código', 'Descripción', 'Familia', 'Marca', 'Modelo', 'Stock', 'Costo', 'Precio', 'Publicado'], rows.map(p => [p.code, p.description, p.family, p.brand, p.model, p.stock, p.cost, p.price, p.published ? 'Sí' : 'No']))
  const upd = (k: keyof Product, v: string | number | boolean) => setEdit(e => e && { ...e, p: { ...e.p, [k]: v } })
  const save = () => {
    const p = edit!.p
    if (!p.description.trim()) return notify('Ingresa la descripción')
    if (p.price <= 0) return notify('El precio debe ser mayor a 0')
    if (p.stock < 0) return notify('El stock no puede ser negativo')
    const err = saveProduct({ ...p, oldPrice: Math.max(p.oldPrice, p.price) }, edit!.isNew)
    if (err) return notify(err)
    setEdit(null); notify('Producto guardado')
  }
  const num = (k: keyof Product, label: string) => <Field label={label}><input type="number" min={0} step="0.01" value={edit!.p[k] as number} onChange={e => upd(k, Number(e.target.value))} /></Field>
  return <section className="panel"><Toolbar variant="productos" search={search} setSearch={setSearch} onExport={exportCsv} onAdd={() => setEdit({ p: blank(nextCode(getDB())), isNew: true })} onExit={exitTo} notify={notify} />
    <DataTable><thead><tr><th></th><th>Código</th><th>Descripción</th><th>Familia</th><th>Marca</th><th className="right">Stock</th><th className="right">Precio</th><th>Tienda</th><th></th></tr></thead>
      <tbody>{slice.map(p => <tr key={p.code}><td><img src={p.image || PLACEHOLDER} onError={e => { e.currentTarget.src = PLACEHOLDER }} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} /></td><td><code>{p.code}</code></td><td><b>{p.description}</b></td><td>{p.family}</td><td>{p.brand}</td><td className="right"><Status green={p.stock > 5}>{p.stock}</Status></td><td className="right">{money(p.price)}</td><td><Status green={p.published}>{p.published ? 'Publicado' : 'Oculto'}</Status></td>
        <td><div className="row-actions"><button title="Editar" onClick={() => setEdit({ p, isNew: false })}><Icon name="edit" size={15} /></button><button title="Duplicar" onClick={() => setEdit({ p: { ...p, code: nextCode(getDB()), description: p.description + ' (copia)' }, isNew: true })}><Icon name="layers" size={15} /></button><button title="Eliminar" onClick={() => confirm(`¿Eliminar "${p.description}"?`) && (deleteProduct(p.code), notify('Producto eliminado'))}><Icon name="trash" size={15} /></button></div></td></tr>)}</tbody></DataTable>
    {footer(`${db.products.length} productos`)}
    {edit && <Modal kicker={edit.isNew ? 'NUEVO REGISTRO' : `CÓDIGO ${edit.p.code}`} title={edit.isNew ? 'Agregar producto' : 'Editar producto'} onClose={() => setEdit(null)} onSave={save}>
      <Field label="Descripción" full><input autoFocus value={edit.p.description} onChange={e => upd('description', e.target.value)} /></Field>
      <Field label="Familia"><select value={edit.p.family} onChange={e => upd('family', e.target.value)}>{['Impresoras', 'Punto de venta', 'Balanzas', 'Lectores', 'Suministros'].map(f => <option key={f}>{f}</option>)}</select></Field>
      <Field label="Marca"><input value={edit.p.brand} onChange={e => upd('brand', e.target.value)} /></Field>
      <Field label="Modelo"><input value={edit.p.model} onChange={e => upd('model', e.target.value)} /></Field>
      {num('stock', 'Stock')}{num('cost', 'Costo (S/)')}{num('price', 'Precio venta (S/)')}{num('oldPrice', 'Precio antes (S/)')}
      <Field label="URL de imagen" full><input value={edit.p.image} onChange={e => upd('image', e.target.value)} placeholder="https://…" /></Field>
      <label className="full" style={{ flexDirection: 'row', alignItems: 'center' }}><input type="checkbox" checked={edit.p.published} onChange={e => upd('published', e.target.checked)} /> <span>Publicar en la tienda</span></label>
    </Modal>}
  </section>
}

/* ---------- Clientes (CRUD) ---------- */
function Clients({ search, setSearch, notify, exitTo }: PageProps) {
  const db = useDB()
  const [edit, setEdit] = useState<{ c: Client; isNew: boolean } | null>(null)
  const rows = db.clients.filter(c => match(Object.values(c), search))
  const { slice, footer } = usePager(rows)
  const exportCsv = () => downloadCsv('clientes', ['Código', 'Nombre', 'Documento', 'Dirección', 'Ciudad', 'Teléfono', 'Correo'], rows.map(c => [c.code, c.name, c.doc, c.address, c.city, c.phone, c.email]))
  const upd = (k: keyof Client, v: string | boolean) => setEdit(e => e && { ...e, c: { ...e.c, [k]: v } })
  const save = () => {
    const c = edit!.c
    if (c.name.trim().length < 3) return notify('Ingresa el nombre o razón social')
    if (!/^(\d{8}|\d{11})$/.test(c.doc)) return notify('Documento: 8 dígitos (DNI) u 11 (RUC)')
    const err = saveClient(c, edit!.isNew); if (err) return notify(err)
    setEdit(null); notify('Cliente guardado')
  }
  const txt = (k: 'name' | 'doc' | 'phone' | 'email' | 'address' | 'city', label: string, full = false) => <Field label={label} full={full}><input value={edit!.c[k]} onChange={e => upd(k, e.target.value)} /></Field>
  return <section className="panel"><Toolbar variant="clientes" search={search} setSearch={setSearch} onExport={exportCsv} onAdd={() => setEdit({ c: { code: nextClientCode(getDB()), name: '', doc: '', address: '', city: '', phone: '', email: '', active: true }, isNew: true })} onExit={exitTo} notify={notify} />
    <DataTable><thead><tr><th>Activo</th><th>Código</th><th>Nombre / Razón social</th><th>Documento</th><th>Dirección</th><th>Ciudad</th><th>Teléfono</th><th></th></tr></thead>
      <tbody>{slice.map(c => <tr key={c.code}><td><span className={`toggle ${c.active ? 'on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => saveClient({ ...c, active: !c.active }, false)} /></td><td><code>{c.code}</code></td><td><b>{c.name}</b></td><td>{c.doc}</td><td className="wide">{c.address}</td><td>{c.city}</td><td>{c.phone}</td>
        <td><div className="row-actions"><button title="Editar" onClick={() => setEdit({ c, isNew: false })}><Icon name="edit" size={15} /></button><button title="Eliminar" onClick={() => confirm(`¿Eliminar a "${c.name}"?`) && (deleteClient(c.code), notify('Cliente eliminado'))}><Icon name="trash" size={15} /></button></div></td></tr>)}</tbody></DataTable>
    {footer(`${db.clients.length} clientes`)}
    {edit && <Modal kicker={edit.isNew ? 'NUEVO REGISTRO' : `CÓDIGO ${edit.c.code}`} title={edit.isNew ? 'Agregar cliente' : 'Editar cliente'} onClose={() => setEdit(null)} onSave={save}>
      {txt('name', 'Nombre / Razón social', true)}{txt('doc', 'DNI / RUC')}{txt('phone', 'Teléfono')}{txt('email', 'Correo', true)}{txt('address', 'Dirección', true)}{txt('city', 'Ciudad')}</Modal>}
  </section>
}

/* ---------- Stock valorizado ---------- */
function Stock({ search, setSearch, notify, exitTo }: PageProps) {
  const db = useDB()
  const [onlyStock, setOnly] = useState(false)
  const rows = db.products.filter(p => (!onlyStock || p.stock > 0) && match(Object.values(p), search))
  const { slice, footer } = usePager(rows)
  const value = rows.reduce((a, p) => a + p.stock * p.cost, 0)
  const exportCsv = () => downloadCsv('stock-valorizado', ['Código', 'Descripción', 'Stock', 'Costo', 'Valor'], rows.map(p => [p.code, p.description, p.stock, p.cost.toFixed(2), (p.stock * p.cost).toFixed(2)]))
  return <section className="panel"><Toolbar variant="stock" search={search} setSearch={setSearch} onExport={exportCsv} onExit={exitTo} notify={notify} /><div className="table-controls"><label><input type="checkbox" checked={onlyStock} onChange={e => setOnly(e.target.checked)} /> Mostrar solo productos con stock mayor a cero</label></div>
    <DataTable><thead><tr><th>Código</th><th>Familia</th><th>Marca</th><th>Descripción</th><th className="right">Stock</th><th className="right">Costo</th><th className="right">Valor stock</th><th className="right">Precio venta</th></tr></thead>
      <tbody>{slice.map(p => <tr key={p.code}><td><code>{p.code}</code></td><td>{p.family}</td><td>{p.brand}</td><td><b>{p.description}</b></td><td className="right"><b>{p.stock}</b></td><td className="right">{money(p.cost)}</td><td className="right">{money(p.stock * p.cost)}</td><td className="right">{money(p.price)}</td></tr>)}</tbody></DataTable>
    {footer(`Valor total: ${money(value)}`)}</section>
}
