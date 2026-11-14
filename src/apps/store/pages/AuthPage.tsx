import { isStaff, type User } from '@/core/types'
import { Icon, type IconName } from '@/shared/components/Icon'
import { LoginForm } from '@/features/auth/LoginForm'
import { RegisterForm } from '@/features/auth/RegisterForm'
import { go } from '../router'

const perks: [IconName, string, string][] = [
  ['box', 'Seguimiento de pedidos', 'Consulta el estado de cada compra en un solo lugar.'],
  ['wallet', 'Factura con tu RUC', 'Compra con razón social y recibe comprobante electrónico.'],
  ['cart', 'Compra más rápido', 'Tus datos de facturación y entrega quedan guardados.'],
]

export function AuthPage({ mode, next }: { mode: 'login' | 'register'; next: string | null }) {
  const safeNext = next && next.startsWith('/') ? next : null
  const done = (u: User) => go(safeNext ?? (isStaff(u) ? '/' : '/cuenta'))
  const q = safeNext ? `?next=${encodeURIComponent(safeNext)}` : ''
  return <div className="auth-page">
    <aside className="auth-side">
      <span className="eyebrow">CUENTA MIYAKE</span>
      <h2>{mode === 'login' ? 'Bienvenido de nuevo' : 'Tu cuenta empresarial'}</h2>
      <p>Una sola cuenta para comprar, facturar y hacer seguimiento a tus pedidos.</p>
      {perks.map(([i, t, s]) => <div className="perk" key={t}><span><Icon name={i} /></span><div><b>{t}</b><small>{s}</small></div></div>)}
    </aside>
    <div className="auth-main">
      {mode === 'login'
        ? <LoginForm kicker="MI CUENTA" title="Iniciar sesión" sub="Ingresa para ver tus pedidos y comprar más rápido." demoRoles={['cliente', 'admin']} onSuccess={done}
            footer={<p className="auth-switch">¿Aún no tienes cuenta? <a href={`#/registro${q}`}>Créala gratis</a></p>} />
        : <>
            <RegisterForm onSuccess={done} />
            <p className="auth-switch">¿Ya tienes cuenta? <a href={`#/login${q}`}>Inicia sesión</a></p>
          </>}
    </div>
  </div>
}
