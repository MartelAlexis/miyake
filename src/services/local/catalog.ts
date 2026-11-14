import { fail, ok } from '@/core/result'
import type { CatalogService } from '../contracts'
import { mutate, read } from './storage'

export const localCatalog: CatalogService = {
  async list({ publishedOnly = false } = {}) {
    const all = read().products
    return publishedOnly ? all.filter(p => p.published) : all
  },
  async save(p, isNew) {
    return mutate(db => {
      const i = db.products.findIndex(x => x.code === p.code)
      if (isNew && i >= 0) return fail('Ya existe un producto con ese código')
      if (isNew) db.products.unshift(p); else if (i >= 0) db.products[i] = p
      return ok()
    })
  },
  async remove(code) { mutate(db => { db.products = db.products.filter(p => p.code !== code) }); return ok() },
}
