import { config } from '@/core/config'
import { fail, ok } from '@/core/result'
import { getSession } from '@/core/session'
import type { Role, Session, User } from '@/core/types'
import type { AuthService } from '../contracts'

/* ⚠️ SOLO DEMO. Los usuarios viven en el navegador (localStorage), por lo que esto NO es seguridad real:
   sirve para probar registro, login, cuenta de cliente y permisos hasta tener backend.
   Las contraseñas se guardan con hash, pero cualquiera con acceso al navegador puede leer/modificar los datos. */
export const DEMO_USERS: (User & { password: string })[] = [
  { id: 'u3', name: 'Distribuidora Andina S.A.C.', email: 'cliente@empresa.pe', password: 'cliente123', role: 'cliente', company: 'Distribuidora Andina S.A.C.', doc: '20512345678', phone: '987654321', address: 'Av. Industrial 450', city: 'Lima' },
  { id: 'u1', name: 'Carlos Chugnas', email: 'admin@miyake.pe', password: 'admin123', role: 'admin' },
  { id: 'u2', name: 'Araceli Torres', email: 'caja@miyake.pe', password: 'caja123', role: 'cajero' },
]
export const roleLabelDemo: Record<Role, string> = { admin: 'Administrador', cajero: 'Cajero', cliente: 'Cliente empresa' }

type Stored = User & { passHash: string }
const KEY = 'miyake:users'
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))
const token = () => 'local.' + Date.now().toString(36) + Math.random().toString(36).slice(2)

async function hash(s: string) {
  const salted = 'miyake-demo:' + s
  if (globalThis.crypto?.subtle) { // no existe en http:// por IP (contexto inseguro) → se usa el respaldo
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salted))
    return 'sha256:' + [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')
  }
  let h = 5381; for (const c of salted) h = ((h << 5) + h + c.charCodeAt(0)) | 0
  return 'djb2:' + h
}

async function loadUsers(): Promise<Stored[]> {
  const raw = localStorage.getItem(KEY)
  if (raw) { try { return JSON.parse(raw) as Stored[] } catch { /* se regenera */ } }
  const seeded = await Promise.all(DEMO_USERS.map(async ({ password, ...u }) => ({ ...u, passHash: await hash(password) })))
  localStorage.setItem(KEY, JSON.stringify(seeded))
  return seeded
}
const saveUsers = (u: Stored[]) => localStorage.setItem(KEY, JSON.stringify(u))
const publicUser = ({ passHash: _p, ...u }: Stored): User => u
const toSession = (u: Stored): Session => ({ token: token(), expiresAt: Date.now() + config.sessionHours * 3600e3, user: publicUser(u) })

export const localAuth: AuthService = {
  async login(email, password) {
    await wait(450) // simula latencia de red
    const users = await loadUsers()
    const h = await hash(password)
    const u = users.find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.passHash === h)
    return u ? ok(toSession(u)) : fail('Correo o contraseña incorrectos')
  },

  async register(input) {
    await wait(450)
    const users = await loadUsers()
    const email = input.email.trim().toLowerCase()
    if (users.some(u => u.email.toLowerCase() === email)) return fail('Ya existe una cuenta con ese correo')
    const u: Stored = { id: 'c' + Date.now().toString(36), name: input.name.trim(), email, role: 'cliente', company: input.company ?? '', doc: input.doc ?? '', phone: input.phone ?? '', address: '', city: '', passHash: await hash(input.password) }
    saveUsers([...users, u])
    return ok(toSession(u))
  },

  async updateProfile(input) {
    const id = getSession()?.user.id
    const users = await loadUsers()
    const i = users.findIndex(u => u.id === id)
    if (i < 0) return fail('Sesión no válida')
    users[i] = { ...users[i], ...input }
    saveUsers(users)
    return ok(publicUser(users[i]))
  },

  async logout() { /* nada que invalidar en local */ },
}
