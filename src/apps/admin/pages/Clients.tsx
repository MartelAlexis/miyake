import { useState } from 'react'
import { downloadCsv } from '@/core/csv'
import { suggestClientCode } from '@/core/pricing'
import type { Client } from '@/core/types'
import { Icon } from '@/shared/components/Icon'
import { services } from '@/services'
import { useClients } from '@/services/hooks'
import type { PageProps } from '../nav'
import { DataTable, EmptyRow, Field, match, Modal, QueryError, Toolbar, usePager } from '../components/ui'

export function Clients({ search, setSearch, notify, exitTo }: PageProps) {
  const q = useClients()
  const [edit, setEdit] = useState<{ c: Client; isNew: boolean } | null>(null)
  const rows = q.data.filter(c => match(Object.values(c), search))
  const { slice, footer } = usePager(rows)
  const exportCsv = () => downloadCsv('clientes', ['Código', 'Nombre', 'Documento', 'Dirección', 'Ciudad', 'Teléfono', 'Correo'], rows.map(c => [c.code, c.name, c.doc, c.address, c.city, c.phone, c.email]))
  const upd = (k: keyof Client, v: string | boolean) => setEdit(e => e && { ...e, c: { ...e.c, [k]: v } })

  const save = async () => {
    const c = edit!.c
    if (c.name.trim().length < 3) return notify('Ingresa el nombre o razón social')
    if (!/^(\d{8}|\d{11})$/.test(c.doc)) return notify('Documento: 8 dígitos (DNI) u 11 (RUC)')
    const r = await services.clients.save(c, edit!.isNew)
    if (!r.ok) return notify(r.error)
    setEdit(null); notify('Cliente guardado')
  }
  const remove = async (c: Client) => {
    if (!confirm(`¿Eliminar a "${c.name}"?`)) return
    const r = await services.clients.remove(c.code)
    notify(r.ok ? 'Cliente eliminado' : r.error)
  }
  const txt = (k: 'name' | 'doc' | 'phone' | 'email' | 'address' | 'city', label: string, full = false) => <Field label={label} full={full}><input value={edit!.c[k]} onChange={e => upd(k, e.target.value)} /></Field>

  return <section className="panel"><Toolbar variant="clientes" search={search} setSearch={setSearch} onExport={exportCsv} onRefresh={q.reload} onAdd={() => setEdit({ c: { code: suggestClientCode(q.data), name: '', doc: '', address: '', city: '', phone: '', email: '', active: true }, isNew: true })} onExit={exitTo} notify={notify} />
    <QueryError error={q.error} retry={q.reload} />
    <DataTable><thead><tr><th>Activo</th><th>Código</th><th>Nombre / Razón social</th><th>Documento</th><th>Dirección</th><th>Ciudad</th><th>Teléfono</th><th></th></tr></thead>
      <tbody>{slice.map(c => <tr key={c.code}><td><span className={`toggle ${c.active ? 'on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => services.clients.save({ ...c, active: !c.active }, false)} /></td><td><code>{c.code}</code></td><td><b>{c.name}</b></td><td>{c.doc}</td><td className="wide">{c.address}</td><td>{c.city}</td><td>{c.phone}</td>
        <td><div className="row-actions"><button title="Editar" onClick={() => setEdit({ c, isNew: false })}><Icon name="edit" size={15} /></button><button title="Eliminar" onClick={() => remove(c)}><Icon name="trash" size={15} /></button></div></td></tr>)}
        {rows.length === 0 && <EmptyRow cols={8} loading={q.loading}>Sin clientes.</EmptyRow>}</tbody></DataTable>
    {footer(`${q.data.length} clientes`)}
    {edit && <Modal kicker={edit.isNew ? 'NUEVO REGISTRO' : `CÓDIGO ${edit.c.code}`} title={edit.isNew ? 'Agregar cliente' : 'Editar cliente'} onClose={() => setEdit(null)} onSave={save}>
      {txt('name', 'Nombre / Razón social', true)}{txt('doc', 'DNI / RUC')}{txt('phone', 'Teléfono')}{txt('email', 'Correo', true)}{txt('address', 'Dirección', true)}{txt('city', 'Ciudad')}</Modal>}
  </section>
}
