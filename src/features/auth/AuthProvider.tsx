import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { clearSession, getSession, setSession, useSession } from '@/core/session'
import type { Result } from '@/core/result'
import type { ProfileInput, RegisterInput, User } from '@/core/types'
import { isStaff } from '@/core/types'
import { services } from '@/services'

type AuthCtx = {
  user: User | null
  login: (email: string, password: string) => Promise<Result<User>>
  register: (input: RegisterInput) => Promise<Result<User>>
  updateProfile: (input: ProfileInput) => Promise<Result<User>>
  logout: () => Promise<void>
}
const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSession()

  // Cierra la sesión automáticamente cuando vence.
  useEffect(() => {
    if (!session) return
    const t = setTimeout(clearSession, Math.max(0, session.expiresAt - Date.now()))
    return () => clearTimeout(t)
  }, [session])

  const login = useCallback<AuthCtx['login']>(async (email, password) => {
    const r = await services.auth.login(email, password)
    if (!r.ok) return r
    setSession(r.data)
    return { ok: true, data: r.data.user }
  }, [])

  const register = useCallback<AuthCtx['register']>(async input => {
    const r = await services.auth.register(input)
    if (!r.ok) return r
    setSession(r.data)
    return { ok: true, data: r.data.user }
  }, [])

  const updateProfile = useCallback<AuthCtx['updateProfile']>(async input => {
    const r = await services.auth.updateProfile(input)
    const s = getSession()
    if (r.ok && s) setSession({ ...s, user: r.data })
    return r
  }, [])

  const logout = useCallback(async () => {
    await services.auth.logout()
    clearSession()
  }, [])

  const value = useMemo(() => ({ user: session?.user ?? null, login, register, updateProfile, logout }), [session, login, register, updateProfile, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return c
}

/** Panel de administración: exige sesión de PERSONAL. Sin sesión → login; cliente → aviso de sin acceso. */
export function RequireStaff({ children, login, denied }: { children: ReactNode; login: ReactNode; denied: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <>{login}</>
  return <>{isStaff(user) ? children : denied}</>
}
