import { useState } from 'react'
import type { Claim } from '@/core/types'
import { Icon } from '@/shared/components/Icon'
import { services } from '@/services'
import { COMPANY } from '../company'

/* Libro de reclamaciones virtual (US9). */
export function Claims({ notify }: { notify: (m: string) => void }) {
  const [f, setF] = useState({ type: 'Reclamo' as Claim['type'], name: '', doc: '', email: '', phone: '', orderNumber: '', detail: '', requestText: '' })
  const [consent, setConsent] = useState(false)
  const [err, setErr] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<Claim | null>(null)
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }))

  async function submit() {
    if (busy) return
    const e: Record<string, string> = {}
    if (f.name.trim().length < 3) e.name = 'Ingresa tu nombre'
    if (!/^(\d{8}|\d{11})$/.test(f.doc)) e.doc = 'DNI (8) o RUC (11 dígitos)'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo no válido'
    if (f.detail.trim().length < 10) e.detail = 'Describe el problema (mínimo 10 caracteres)'
    if (!consent) e.consent = 'Debes aceptar el tratamiento de tus datos personales'
    setErr(e)
    if (Object.keys(e).length) return notify('Revisa los campos marcados')
    setBusy(true)
    const r = await services.claims.create({ ...f, consent })
    setBusy(false)
    if (r.ok) setDone(r.data); else notify(r.error)
  }
  const field = (k: keyof typeof f, label: string, full = false) => <label className={full ? 'full' : ''}><span>{label}</span><input value={f[k]} onChange={e => set(k, e.target.value)} className={err[k] ? 'bad' : ''} />{err[k] && <em>{err[k]}</em>}</label>

  if (done) return <div className="panel pad done"><span className="done-icon"><Icon name="check" size={28} /></span><h2>Hemos registrado tu {done.type.toLowerCase()}</h2>
    <p>Tu número de registro es <b>{done.number}</b>. Te responderemos al correo <b>{done.email}</b> en un plazo máximo de 15 días calendario.</p><a className="shop-now" href="#/">Volver al inicio</a></div>

  return <div className="panel pad" style={{ maxWidth: 720, margin: '20px auto' }}>
    <h2>Libro de reclamaciones</h2>
    <p className="note" style={{ fontSize: 12 }}>{COMPANY.name} · {COMPANY.address}</p>
    <div className="form-grid">
      <label className="full"><span>Tipo</span><select value={f.type} onChange={e => set('type', e.target.value)}><option value="Reclamo">Reclamo (disconformidad con el producto o servicio)</option><option value="Queja">Queja (malestar con la atención)</option></select></label>
      {field('name', 'Nombre completo', true)}{field('doc', 'DNI o RUC')}{field('phone', 'Celular')}{field('email', 'Correo electrónico', true)}{field('orderNumber', 'N.° de pedido (opcional)', true)}
      <label className="full"><span>Detalle</span><textarea rows={4} value={f.detail} onChange={e => set('detail', e.target.value)} className={err.detail ? 'bad' : ''} />{err.detail && <em>{err.detail}</em>}</label>
      <label className="full"><span>Pedido del consumidor</span><textarea rows={2} value={f.requestText} onChange={e => set('requestText', e.target.value)} /></label>
    </div>
    <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Autorizo el tratamiento de mis datos personales para atender este registro (Ley N.° 29733).</span></label>
    {err.consent && <em className="consent-err">{err.consent}</em>}
    <button className="shop-now wide-btn" disabled={busy} onClick={submit}>{busy ? 'Enviando…' : 'Enviar'}</button>
  </div>
}
