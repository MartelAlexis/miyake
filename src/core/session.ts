import { useSyncExternalStore } from 'react'
import type { Session } from './types'

/* Almacén de la sesión (token + usuario). Lo leen el cliente HTTP y la UI.
   NOTA PARA PRODUCCIÓN: guardar el token en localStorage es aceptable para empezar, pero lo ideal
   es una cookie httpOnly emitida por el backend (resistente a XSS). Si migras a cookies, solo cambia este archivo
   y agrega `credentials: 'include'` en core/http.ts. */

const KEY = 'miyake:session'
const subs = new Set<() => void>()
let lastRaw: string | null | undefined
let cached: Session | null = null

function read(): Session | null {
  const raw = localStorage.getItem(KEY)
  if (raw !== lastRaw) {
    lastRaw = raw
    try { cached = raw ? (JSON.parse(raw) as Session) : null } catch { cached = null }
  }
  if (cached && cached.expiresAt <= Date.now()) { localStorage.removeItem(KEY); lastRaw = null; cached = null }
  return cached
}
const emit = () => subs.forEach(f => f())

export const getSession = read
export function setSession(s: Session) { localStorage.setItem(KEY, JSON.stringify(s)); emit() }
export function clearSession() { localStorage.removeItem(KEY); emit() }

function subscribe(f: () => void) {
  subs.add(f)
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === null) f() } // cierra sesión en todas las pestañas
  window.addEventListener('storage', onStorage)
  return () => { subs.delete(f); window.removeEventListener('storage', onStorage) }
}
export const useSession = () => useSyncExternalStore(subscribe, read)
