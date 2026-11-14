import { useState, type FormEvent } from 'react'
import type { User } from '@/core/types'
import { useAuth } from './AuthProvider'
import './auth.css'

export function RegisterForm({ onSuccess }: { onSuccess: (u: User) => void }) {
  const { register } = useAuth()
  const [f, setF] = useState({ name: '', company: '', doc: '', phone: '', email: '', password: '', password2: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF(s => ({ ...s, [k]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    const x: Record<string, string> = {}
    if (f.name.trim().length < 3) x.name = 'Ingresa tu nombre completo'
    if (!/^(\d{8}|\d{11})$/.test(f.doc)) x.doc = 'DNI (8 dígitos) o RUC (11 dígitos)'
    if (!/^9\d{8}$/.test(f.phone)) x.phone = 'Celular de 9 dígitos (empieza con 9)'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Correo no válido'
    if (f.password.length < 8) x.password = 'Mínimo 8 caracteres'
    if (f.password2 !== f.password) x.password2 = 'Las contraseñas no coinciden'
    setErr(x); setFormError('')
    if (Object.keys(x).length) return
    setBusy(true)
    const r = await register({ name: f.name, company: f.company, doc: f.doc, phone: f.phone, email: f.email, password: f.password })
    setBusy(false)
    if (!r.ok) setFormError(r.error); else onSuccess(r.data)
  }

  const field = (k: keyof typeof f, label: string, opts: { type?: string; ph?: string; full?: boolean; auto?: string } = {}) =>
    <label className={opts.full ? 'full' : ''}><span>{label}</span><input type={opts.type ?? 'text'} autoComplete={opts.auto} value={f[k]} onChange={set(k)} placeholder={opts.ph} className={err[k] ? 'bad' : ''} />{err[k] && <em>{err[k]}</em>}</label>

  return <form className="login-card register-card" onSubmit={submit} noValidate>
    <p className="login-kicker">NUEVA CUENTA</p>
    <h2>Crea tu cuenta</h2>
    <p className="login-sub">Compra más rápido, descarga tus comprobantes y revisa tus pedidos.</p>
    <div className="reg-grid">
      {field('name', 'Nombre completo', { full: true, auto: 'name' })}
      {field('company', 'Razón social (opcional)', { full: true, auto: 'organization', ph: 'Empresa S.A.C.' })}
      {field('doc', 'DNI o RUC', { ph: '20123456789' })}
      {field('phone', 'Celular', { ph: '987654321', auto: 'tel' })}
      {field('email', 'Correo electrónico', { type: 'email', full: true, auto: 'email' })}
      {field('password', 'Contraseña', { type: 'password', auto: 'new-password' })}
      {field('password2', 'Repite la contraseña', { type: 'password', auto: 'new-password' })}
    </div>
    {formError && <div className="login-error" role="alert">{formError}</div>}
    <button className="login-submit" disabled={busy}>{busy ? 'Creando cuenta…' : 'Crear cuenta'}</button>
  </form>
}
