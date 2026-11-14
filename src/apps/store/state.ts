import { useSyncExternalStore } from 'react'

/* Estado del cliente que persiste en el navegador (carrito y favoritos).
   Cuando existan cuentas de cliente, el carrito puede sincronizarse con el backend cambiando solo este archivo. */
function persisted<T>(key: string, initial: T) {
  const subs = new Set<() => void>()
  let raw = '', val = initial
  const get = () => {
    const r = localStorage.getItem(key) ?? ''
    if (r !== raw) { raw = r; try { val = r ? JSON.parse(r) : initial } catch { val = initial } }
    return val
  }
  const set = (v: T) => { localStorage.setItem(key, JSON.stringify(v)); subs.forEach(f => f()) }
  const sub = (f: () => void) => { subs.add(f); window.addEventListener('storage', f); return () => { subs.delete(f); window.removeEventListener('storage', f) } }
  return () => [useSyncExternalStore(sub, get), set] as const
}
export const useCartStore = persisted<Record<string, number>>('miyake:cart', {})
export const useWishStore = persisted<string[]>('miyake:wish', [])
