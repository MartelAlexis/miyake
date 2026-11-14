import { useState } from 'react'
import { downloadCsv } from '@/core/csv'
import { PLACEHOLDER, money } from '@/core/format'
import { suggestProductCode } from '@/core/pricing'
import type { Product } from '@/core/types'
import { Icon } from '@/shared/components/Icon'
import { services } from '@/services'
import { useProducts } from '@/services/hooks'
import type { PageProps } from '../nav'
import { DataTable, EmptyRow, Field, match, Modal, QueryError, Status, Toolbar, usePager } from '../components/ui'

const blank = (code: string): Product => ({ code, description: '', model: '', family: 'Punto de venta', brand: '', stock: 0, unit: 'UND', cost: 0, price: 0, oldPrice: 0, rating: 4.5, image: '', published: true })

export function Products({ search, setSearch, notify, exitTo }: PageProps) {
  const q = useProducts()
  const [edit, setEdit] = useState<{ p: Product; isNew: boolean } | null>(null)
  const rows = q.data.filter(p => match(Object.values(p), search))
  const { slice, footer } = usePager(rows)
  const exportCsv = () => downloadCsv('productos', ['Código', 'Descripción', 'Familia', 'Marca', 'Modelo', 'Stock', 'Costo', 'Precio', 'Publicado'], rows.map(p => [p.code, p.description, p.family, p.brand, p.model, p.stock, p.cost, p.price, p.published ? 'Sí' : 'No']))
  const upd = (k: keyof Product, v: string | number | boolean) => setEdit(e => e && { ...e, p: { ...e.p, [k]: v } })

  const save = async () => {
    const p = edit!.p
    if (!p.description.trim()) return notify('Ingresa la descripción')
    if (p.price <= 0) return notify('El precio debe ser mayor a 0')
    if (p.stock < 0) return notify('El stock no puede ser negativo')
    const r = await services.catalog.save({ ...p, oldPrice: Math.max(p.oldPrice, p.price) }, edit!.isNew)
    if (!r.ok) return notify(r.error)
    setEdit(null); notify('Producto guardado')
  }
  const remove = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.description}"?`)) return
    const r = await services.catalog.remove(p.code)
    notify(r.ok ? 'Producto eliminado' : r.error)
  }
  const num = (k: keyof Product, label: string) => <Field label={label}><input type="number" min={0} step="0.01" value={edit!.p[k] as number} onChange={e => upd(k, Number(e.target.value))} /></Field>

  return <section className="panel"><Toolbar variant="productos" search={search} setSearch={setSearch} onExport={exportCsv} onRefresh={q.reload} onAdd={() => setEdit({ p: blank(suggestProductCode(q.data)), isNew: true })} onExit={exitTo} notify={notify} />
    <QueryError error={q.error} retry={q.reload} />
    <DataTable><thead><tr><th></th><th>Código</th><th>Descripción</th><th>Familia</th><th>Marca</th><th className="right">Stock</th><th className="right">Precio</th><th>Tienda</th><th></th></tr></thead>
      <tbody>{slice.map(p => <tr key={p.code}><td><img src={p.image || PLACEHOLDER} onError={e => { e.currentTarget.src = PLACEHOLDER }} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} /></td><td><code>{p.code}</code></td><td><b>{p.description}</b></td><td>{p.family}</td><td>{p.brand}</td><td className="right"><Status green={p.stock > 5}>{p.stock}</Status></td><td className="right">{money(p.price)}</td><td><Status green={p.published}>{p.published ? 'Publicado' : 'Oculto'}</Status></td>
        <td><div className="row-actions"><button title="Editar" onClick={() => setEdit({ p, isNew: false })}><Icon name="edit" size={15} /></button><button title="Duplicar" onClick={() => setEdit({ p: { ...p, code: suggestProductCode(q.data), description: p.description + ' (copia)' }, isNew: true })}><Icon name="layers" size={15} /></button><button title="Eliminar" onClick={() => remove(p)}><Icon name="trash" size={15} /></button></div></td></tr>)}
        {rows.length === 0 && <EmptyRow cols={9} loading={q.loading}>Sin productos.</EmptyRow>}</tbody></DataTable>
    {footer(`${q.data.length} productos`)}
    {edit && <Modal kicker={edit.isNew ? 'NUEVO REGISTRO' : `CÓDIGO ${edit.p.code}`} title={edit.isNew ? 'Agregar producto' : 'Editar producto'} onClose={() => setEdit(null)} onSave={save}>
      <Field label="Descripción" full><input autoFocus value={edit.p.description} onChange={e => upd('description', e.target.value)} /></Field>
      <Field label="Familia"><select value={edit.p.family} onChange={e => upd('family', e.target.value)}>{['Impresoras', 'Punto de venta', 'Balanzas', 'Lectores', 'Suministros'].map(f => <option key={f}>{f}</option>)}</select></Field>
      <Field label="Marca"><input value={edit.p.brand} onChange={e => upd('brand', e.target.value)} /></Field>
      <Field label="Modelo"><input value={edit.p.model} onChange={e => upd('model', e.target.value)} /></Field>
      {num('stock', 'Stock')}{num('cost', 'Costo (S/)')}{num('price', 'Precio venta (S/)')}{num('oldPrice', 'Precio antes (S/)')}
      <Field label="URL de imagen" full><input value={edit.p.image} onChange={e => upd('image', e.target.value)} placeholder="https://…" /></Field>
      <label className="full" style={{ flexDirection: 'row', alignItems: 'center' }}><input type="checkbox" checked={edit.p.published} onChange={e => upd('published', e.target.checked)} /> <span>Publicar en la tienda</span></label>
    </Modal>}
  </section>
}
