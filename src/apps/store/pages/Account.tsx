import { useState } from 'react'
import { money } from '@/core/format'
import type { ProfileInput, User } from '@/core/types'
import { Empty } from '@/shared/components/Empty'
import { useAuth } from '@/features/auth/AuthProvider'
import { useMyOrders } from '@/services/hooks'
import { go } from '../router'

export function Account({ tab, notify }: { tab: 'pedidos' | 'datos'; notify: (m: string) => void }) {
  const { user, logout } = useAuth()
  if (!user) return null
  return <div className="account">
    <aside className="account-nav panel">
      <div className="account-who"><span className="avatar big">{user.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</span><b>{user.name}</b><small>{user.email}</small></div>
      <a className={tab === 'pedidos' ? 'active' : ''} href="#/cuenta">Mis pedidos</a>
      <a className={tab === 'datos' ? 'active' : ''} href="#/cuenta/datos">Mis datos</a>
      <button onClick={async () => { await logout(); go('/') }}>Cerrar sesión</button>
    </aside>
    <section>{tab === 'pedidos' ? <MyOrders user={user} /> : <MyData user={user} notify={notify} />}</section>
  </div>
}

function MyOrders({ user }: { user: User }) {
  const q = useMyOrders(user.id)
  const [open, setOpen] = useState<string | null>(null)
  return <div className="panel pad">
    <h2>Mis pedidos</h2>
    {q.error && <div className="query-error">{q.error}</div>}
    {q.data.length === 0 && (q.loading ? <p>Cargando…</p> : <Empty title="Aún no tienes pedidos" text="Cuando compres con tu cuenta, aparecerán aquí." />)}
    {q.data.map(o => <div className="my-order" key={o.number}>
      <button className="my-order-head" onClick={() => setOpen(open === o.number ? null : o.number)}>
        <div><b>{o.number}</b><small>{o.date.slice(0, 10)} · {o.invoiceType ?? 'Boleta'} · {o.items.length} producto{o.items.length === 1 ? '' : 's'}</small></div>
        <span className={`status ${o.status === 'Entregado' ? 'green' : ''}`}>{o.status}</span><b>{money(o.total)}</b>
      </button>
      {open === o.number && <div className="my-order-body">
        {o.items.map(i => <div className="sum" key={i.code}><span>{i.qty} × {i.description}</span><b>{money(i.qty * i.price)}</b></div>)}
        <div className="sum"><span>Envío</span><b>{o.shipping ? money(o.shipping) : 'Gratis'}</b></div>
        <div className="sum total"><span>Total ({o.payment})</span><b>{money(o.total)}</b></div>
        <small>{o.delivery}: {o.address}{o.delivery === 'Despacho' ? `, ${o.city}` : ''}</small>
      </div>}
    </div>)}
  </div>
}

function MyData({ user, notify }: { user: User; notify: (m: string) => void }) {
  const { updateProfile } = useAuth()
  const [f, setF] = useState<ProfileInput>({ name: user.name, company: user.company ?? '', doc: user.doc ?? '', phone: user.phone ?? '', address: user.address ?? '', city: user.city ?? '' })
  const [busy, setBusy] = useState(false)
  const set = (k: keyof ProfileInput) => (e: { target: { value: string } }) => setF(s => ({ ...s, [k]: e.target.value }))
  async function save() {
    if (f.name.trim().length < 3) return notify('Ingresa tu nombre')
    if (f.doc && !/^(\d{8}|\d{11})$/.test(f.doc)) return notify('Documento: 8 dígitos (DNI) u 11 (RUC)')
    if (f.phone && !/^9\d{8}$/.test(f.phone)) return notify('Celular de 9 dígitos (empieza con 9)')
    setBusy(true); const r = await updateProfile(f); setBusy(false)
    notify(r.ok ? 'Datos guardados' : r.error)
  }
  const field = (k: keyof ProfileInput, label: string, full = false) => <label className={full ? 'full' : ''}><span>{label}</span><input value={f[k]} onChange={set(k)} /></label>
  return <div className="panel pad"><h2>Mis datos</h2>
    <div className="form-grid">{field('name', 'Nombre completo', true)}{field('company', 'Razón social', true)}{field('doc', 'DNI o RUC')}{field('phone', 'Celular')}{field('address', 'Dirección de entrega', true)}{field('city', 'Ciudad')}
      <label className="full"><span>Correo (no editable)</span><input value={user.email} disabled /></label></div>
    <button className="shop-now" disabled={busy} onClick={save} style={{ marginTop: 6 }}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
    <p className="note">Estos datos se usan para rellenar automáticamente tu compra.</p>
  </div>
}
