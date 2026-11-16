import { useState } from 'react'
import { money } from '@/core/format'
import { shippingFor } from '@/core/pricing'
import type { InvoiceType, Order } from '@/core/types'
import { Empty } from '@/shared/components/Empty'
import { Icon } from '@/shared/components/Icon'
import { useAuth } from '@/features/auth/AuthProvider'
import { services } from '@/services'
import type { CartLine } from '../components/CartDrawer'
import { COMPANY } from '../company'

export function Checkout({ lines, subtotal, onDone, notify }: { lines: CartLine[]; subtotal: number; onDone: (o: Order) => void; notify: (m: string) => void }) {
  const { user } = useAuth()
  // Si hay sesión de cliente, los datos se rellenan desde su cuenta.
  const mine = user?.role === 'cliente' ? user : null
  const [f, setF] = useState({ name: mine?.company || mine?.name || '', doc: mine?.doc ?? '', phone: mine?.phone ?? '', email: mine?.email ?? '', delivery: 'Despacho' as 'Despacho' | 'Recojo', address: mine?.address ?? '', city: mine?.city || 'Lima', payment: 'Yape', invoiceType: (mine?.doc?.length === 11 ? 'Factura' : 'Boleta') as InvoiceType })
  const [err, setErr] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [consent, setConsent] = useState(false)
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }))
  const shipping = shippingFor(subtotal, f.delivery, f.city)
  if (lines.length === 0) return <Empty title="Tu carrito está vacío" text="Agrega productos antes de pagar." />

  async function submit() {
    if (busy) return
    const e: Record<string, string> = {}
    if (f.name.trim().length < 3) e.name = 'Ingresa tu nombre o razón social'
    if (f.invoiceType === 'Factura') { if (!/^\d{11}$/.test(f.doc)) e.doc = 'La factura requiere un RUC de 11 dígitos' }
    else if (!/^(\d{8}|\d{11})$/.test(f.doc)) e.doc = 'DNI (8 dígitos) o RUC (11 dígitos)'
    if (!/^9\d{8}$/.test(f.phone)) e.phone = 'Celular de 9 dígitos (empieza con 9)'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo no válido'
    if (f.delivery === 'Despacho' && f.address.trim().length < 5) e.address = 'Ingresa la dirección de entrega'
    if (!consent) e.consent = 'Debes aceptar el tratamiento de tus datos personales'
    setErr(e)
    if (Object.keys(e).length) return notify('Revisa los campos marcados')
    setBusy(true)
    const r = await services.orders.place({ ...f, consent, address: f.delivery === 'Recojo' ? 'Recojo en tienda Pueblo Libre' : f.address, items: lines.map(l => ({ code: l.product.code, description: l.product.description, qty: l.qty, price: l.product.price })) })
    setBusy(false)
    if (r.ok) onDone(r.data); else notify(r.error)
  }
  const field = (k: keyof typeof f, label: string, ph = '', full = false) => <label className={full ? 'full' : ''}><span>{label}</span><input value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph} className={err[k] ? 'bad' : ''} />{err[k] && <em>{err[k]}</em>}</label>
  return <div className="checkout">
    <div className="panel pad"><h2>Datos de compra</h2>
      {!user && <div className="checkout-login"><span>¿Ya tienes cuenta? Ingresa para usar tus datos guardados y ver tu pedido después.</span><a className="auth-link" href="#/login?next=/checkout">Ingresar</a><a className="auth-cta" href="#/registro?next=/checkout">Crear cuenta</a></div>}
      <div className="form-grid">
        <label className="full"><span>Comprobante</span><select value={f.invoiceType} onChange={e => set('invoiceType', e.target.value)}><option value="Boleta">Boleta de venta</option><option value="Factura">Factura (requiere RUC)</option></select></label>
        {field('name', f.invoiceType === 'Factura' ? 'Razón social' : 'Nombre completo', '', true)}{field('doc', f.invoiceType === 'Factura' ? 'RUC' : 'DNI o RUC', '20123456789')}{field('phone', 'Celular', '987654321')}{field('email', 'Correo electrónico', 'tucorreo@empresa.com', true)}
        <label className="full"><span>Entrega</span><select value={f.delivery} onChange={e => set('delivery', e.target.value)}><option value="Despacho">Despacho a domicilio</option><option value="Recojo">Recojo en tienda (Pueblo Libre) · gratis</option></select></label>
        {f.delivery === 'Despacho' && <>{field('address', 'Dirección', 'Av. / Jr. / Calle y número', true)}{field('city', 'Ciudad')}</>}
        <label className="full"><span>Método de pago</span><select value={f.payment} onChange={e => set('payment', e.target.value)}><option>Yape</option><option>Transferencia</option><option>Tarjeta</option><option>Contra entrega</option></select></label>
      </div>
      <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
        <span>Autorizo el tratamiento de mis datos personales para gestionar mi pedido, conforme a la Ley N.° 29733 (Protección de Datos Personales). Puedes ejercer tus derechos ARCO escribiendo a {COMPANY.email}.</span></label>
      {err.consent && <em className="consent-err">{err.consent}</em>}
      <p className="note">Esta tienda es una demostración: no se realiza ningún cobro real.</p>
    </div>
    <aside className="panel pad summary"><h2>Resumen</h2>
      {lines.map(l => <div className="sum" key={l.product.code}><span>{l.qty} × {l.product.description}</span><b>{money(l.qty * l.product.price)}</b></div>)}
      <div className="sum"><span>Subtotal</span><b>{money(subtotal)}</b></div>
      <div className="sum"><span>Envío</span><b>{shipping ? money(shipping) : 'Gratis'}</b></div>
      <div className="sum total"><span>Total</span><b>{money(subtotal + shipping)}</b></div>
      <button className="shop-now wide-btn" disabled={busy} onClick={submit}>{busy ? 'Procesando…' : <>Confirmar pedido <Icon name="check" /></>}</button>
    </aside>
  </div>
}
