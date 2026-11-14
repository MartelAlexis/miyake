import { invalidateAll } from '@/core/query'
import { seed, type LocalDB } from './seed'

/* Persistencia de la demo en localStorage. Se mantiene la clave original para no perder datos existentes. */
const KEY = 'Miyake:db:v1'
let cache: { raw: string; db: LocalDB } | null = null

export function read(): LocalDB {
  let raw = localStorage.getItem(KEY)
  if (!raw) { raw = JSON.stringify(seed()); localStorage.setItem(KEY, raw) }
  if (!cache || cache.raw !== raw) cache = { raw, db: JSON.parse(raw) as LocalDB }
  return cache.db
}

export function mutate<T>(fn: (db: LocalDB) => T): T {
  const db: LocalDB = JSON.parse(JSON.stringify(read()))
  const out = fn(db)
  localStorage.setItem(KEY, JSON.stringify(db))
  return out
}

export function resetDB() { localStorage.removeItem(KEY); invalidateAll() }

// Sincroniza pestañas: si otra pestaña cambia los datos, se refrescan las consultas.
window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) invalidateAll() })
