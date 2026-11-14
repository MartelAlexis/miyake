import { fail, ok } from '@/core/result'
import type { ClientsService } from '../contracts'
import { mutate, read } from './storage'

export const localClients: ClientsService = {
  async list() { return read().clients },
  async save(c, isNew) {
    return mutate(db => {
      const i = db.clients.findIndex(x => x.code === c.code)
      if (isNew && i >= 0) return fail('Ya existe un cliente con ese código')
      if (isNew) db.clients.unshift(c); else if (i >= 0) db.clients[i] = c
      return ok()
    })
  },
  async remove(code) { mutate(db => { db.clients = db.clients.filter(c => c.code !== code) }); return ok() },
}
