import { useState, type FormEvent, type ReactNode } from 'react'
import { config } from '@/core/config'
import type { Role, User } from '@/core/types'
import { Icon } from '@/shared/components/Icon'
import { DEMO_USERS, roleLabelDemo } from '@/services/local/auth'
import { useAuth } from './AuthProvider'
import './auth.css'

/* Formulario único de inicio de sesión, usado por la tienda y por el panel. */
export function LoginForm({ kicker, title, sub, demoRoles, onSuccess, footer }: { kicker: string; title: string; sub: string; demoRoles: Role[]; onSuccess?: (u: User) => void; footer?: ReactNode }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Ingresa un correo válido')
    if (!password) return setError('Ingresa tu contraseña')
    setError(''); setBusy(true)
    const r = await login(email, password)
    setBusy(false)
    if (!r.ok) setError(r.error); else onSuccess?.(r.data)
  }

  return <form className="login-card" onSubmit={submit} noValidate>
    <p className="login-kicker">{kicker}</p>
    <h2>{title}</h2>
    <p className="login-sub">{sub}</p>

    <label><span>Correo electrónico</span>
      <input type="email" autoComplete="username" autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" /></label>
    <label><span>Contraseña</span>
      <div className="pass">
        <input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        <button type="button" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShow(s => !s)}><Icon name="eye" size={17} /></button>
      </div></label>

    {error && <div className="login-error" role="alert">{error}</div>}
    <button className="login-submit" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>

    {config.dataSource === 'local' && <div className="login-demo">
      <b>Modo demostración</b>
      <span>Aún no hay servidor: toca una cuenta de prueba para rellenar el formulario.</span>
      {DEMO_USERS.filter(u => demoRoles.includes(u.role)).map(u => <button type="button" key={u.id} onClick={() => { setEmail(u.email); setPassword(u.password); setError('') }}>
        <span>{roleLabelDemo[u.role]}</span><code>{u.email}</code></button>)}
    </div>}
    {footer}
  </form>
}
