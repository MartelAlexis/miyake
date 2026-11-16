import { ok } from '@/core/result'
import type { Claim } from '@/core/types'
import type { ClaimsService } from '../contracts'

/* Demo: los reclamos viven en localStorage (clave propia, no toca el resto de la base local). */
const KEY = 'miyake:claims'
const load = (): Claim[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Claim[] } catch { return [] } }
const save = (c: Claim[]) => localStorage.setItem(KEY, JSON.stringify(c))

export const localClaims: ClaimsService = {
  async create(input) {
    const all = load()
    const now = new Date().toISOString()
    const { consent: _c, ...rest } = input
    const claim: Claim = { ...rest, number: 'REC-' + String(all.length + 1).padStart(6, '0'), createdAt: now, consentAt: now, status: 'Pendiente', response: '' }
    save([claim, ...all])
    return ok(claim)
  },
  async list() { return load() },
  async respond(number, response) { save(load().map(c => c.number === number ? { ...c, response, status: 'Atendido' as const } : c)); return ok() },
}
