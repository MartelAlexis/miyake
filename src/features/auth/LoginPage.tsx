import { LoginForm } from './LoginForm'
import './auth.css'

/* Pantalla de acceso del PANEL de administración (solo personal). Los clientes inician sesión en la tienda. */
export function LoginPage() {
  return <div className="login-shell">
    <aside className="login-brand">
      <div className="login-logo"><span className="brand-mark">M</span><b>Miyake</b></div>
      <div>
        <h1>Gestión comercial,<br />en un solo lugar.</h1>
        <p>Controla pedidos, ventas, productos y stock de tu negocio desde cualquier dispositivo.</p>
      </div>
      <small>© {new Date().getFullYear()} Miyake · Tecnología para tu negocio</small>
    </aside>
    <main className="login-panel">
      <LoginForm kicker="PANEL DE ADMINISTRACIÓN" title="Acceso del personal" sub="Ingresa con tu cuenta de trabajo de Miyake." demoRoles={['admin', 'cajero']}
        footer={<a className="login-back" href="/">← Volver a la tienda</a>} />
    </main>
  </div>
}
