import { useAuth } from './AuthProvider'
import './auth.css'

/* Un cliente con sesión abrió el panel: se le explica y se le ofrece volver o cambiar de cuenta. */
export function NoAccess() {
  const { user, logout } = useAuth()
  return <div className="login-panel" style={{ minHeight: '100vh' }}>
    <div className="login-card" style={{ textAlign: 'center' }}>
      <p className="login-kicker">SIN PERMISOS</p>
      <h2>Esta sección es solo para el personal</h2>
      <p className="login-sub">Iniciaste sesión como <b>{user?.email}</b>, que es una cuenta de cliente.</p>
      <a className="login-submit" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }} href="/">Ir a la tienda</a>
      <button className="login-back" style={{ background: 'none', border: 0 }} onClick={() => logout()}>Usar otra cuenta</button>
    </div>
  </div>
}
