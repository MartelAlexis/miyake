import { useState } from 'react'
import { isStaff, type User } from '@/core/types'
import { Icon } from '@/shared/components/Icon'
import { roleLabel } from '@/features/auth/permissions'
import { categories } from '../categories'
import { COMPANY } from '../company'
import { go } from '../router'

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

/* Barra superior corporativa: contacto y accesos rápidos. */
export function TopBar() {
  return <div className="topbar"><div className="topbar-in">
    <span>Atención a empresas: <b>{COMPANY.phone}</b> · {COMPANY.email} · {COMPANY.hours}</span>
    <span className="topbar-links"><span><Icon name="truck" size={13} /> Envíos a todo el Perú</span><span><Icon name="check" size={13} /> Factura electrónica</span><a href="/admin.html">Acceso personal</a></span>
  </div></div>
}

/* Acceso de cuenta SIEMPRE visible: sin sesión muestra Ingresar / Crear cuenta; con sesión, un menú de usuario. */
export function AccountArea({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  if (!user) return <div className="auth-area">
    <a className="auth-link" href="#/login"><Icon name="users" size={16} /> Ingresar</a>
    <a className="auth-cta" href="#/registro">Crear cuenta</a>
  </div>
  const close = () => setOpen(false)
  return <div className="user-menu">
    <button className="user-chip" onClick={() => setOpen(o => !o)} aria-expanded={open}><span className="avatar">{initials(user.name)}</span><span className="user-chip-name">{user.name.split(' ')[0]}</span><Icon name="chevron" size={14} /></button>
    {open && <><div className="menu-shield" onClick={close} />
      <div className="menu-pop" role="menu">
        <div className="menu-head"><b>{user.name}</b><small>{user.email}</small><small>{roleLabel[user.role]}</small></div>
        {isStaff(user)
          ? <a href="/admin.html" onClick={close}><Icon name="grid" size={15} /> Ir al panel de administración</a>
          : <><a href="#/cuenta" onClick={close}><Icon name="box" size={15} /> Mis pedidos</a><a href="#/cuenta/datos" onClick={close}><Icon name="edit" size={15} /> Mis datos</a></>}
        <button onClick={() => { close(); onLogout() }}><Icon name="arrow-out" size={15} /> Cerrar sesión</button>
      </div></>}
  </div>
}

/* Navegación por categorías. */
export function CategoryNav({ current }: { current: string }) {
  const items: [string, string][] = [['Todos los productos', 'Todos'], ...categories.map(([c]) => [c, c] as [string, string]), ['Ofertas', 'Ofertas']]
  return <nav className="catnav"><div className="catnav-in">{items.map(([label, cat]) =>
    <button key={cat} className={current === cat ? 'active' : ''} onClick={() => go(cat === 'Todos' ? '/catalogo' : '/catalogo?cat=' + encodeURIComponent(cat))}>{label}</button>)}</div></nav>
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer-in">
      <div><div className="foot-brand"><span className="brand-mark">M</span><b>{COMPANY.name}</b></div><p>{COMPANY.tagline}. Equipamos tu punto de venta con productos confiables, factura electrónica y soporte especializado.</p></div>
      <div><h5>Comprar</h5>{categories.map(([c]) => <a key={c} href={`#/catalogo?cat=${encodeURIComponent(c)}`}>{c}</a>)}<a href="#/catalogo?cat=Ofertas">Ofertas</a></div>
      <div><h5>Mi cuenta</h5><a href="#/login">Ingresar</a><a href="#/registro">Crear cuenta</a><a href="#/cuenta">Mis pedidos</a><a href="#/checkout">Finalizar compra</a></div>
      <div><h5>Contacto</h5><span>{COMPANY.phone} · WhatsApp {COMPANY.whatsapp}</span><span>{COMPANY.email}</span><span>{COMPANY.address}</span><span>{COMPANY.hours}</span><a href="/admin.html">Acceso personal →</a></div>
    </div>
    <div className="site-footer-bottom"><span>© {new Date().getFullYear()} {COMPANY.name} · {COMPANY.tagline}</span><span>Garantía asegurada · Envíos a todo el Perú · Comprobante electrónico</span></div>
  </footer>
}
