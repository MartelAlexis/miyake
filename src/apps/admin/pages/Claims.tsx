import { useState } from 'react'
import type { Claim } from '@/core/types'
import { services } from '@/services'
import { useClaims } from '@/services/hooks'
import type { PageProps } from '../nav'
import { DataTable, EmptyRow, Field, match, Modal, QueryError, Status, usePager } from '../components/ui'

export function Claims({ search, notify }: Pick<PageProps, 'search' | 'notify'>) {
  const q = useClaims()
  const [open, setOpen] = useState<Claim | null>(null)
  const [text, setText] = useState('')
  const rows = q.data.filter(c => match([c.number, c.name, c.doc, c.type, c.status], search))
  const { slice, footer } = usePager(rows)
  const save = async () => {
    if (!open || text.trim().length < 3) return notify('Escribe la respuesta')
    const r = await services.claims.respond(open.number, text.trim())
    if (!r.ok) return notify(r.error)
    setOpen(null); notify('Respuesta registrada')
  }
  return <section className="panel">
    <QueryError error={q.error} retry={q.reload} />
    <DataTable><thead><tr><th>N.°</th><th>Fecha</th><th>Tipo</th><th>Cliente</th><th>Detalle</th><th>Estado</th><th></th></tr></thead>
      <tbody>{slice.map(c => <tr key={c.number}><td><code>{c.number}</code></td><td>{c.createdAt.slice(0, 10)}</td><td>{c.type}</td><td><b>{c.name}</b><br /><small>{c.doc} · {c.email}</small></td><td className="wide">{c.detail}</td><td><Status green={c.status === 'Atendido'}>{c.status}</Status></td>
        <td><button className="mini-btn" onClick={() => { setOpen(c); setText(c.response ?? '') }}>{c.status === 'Atendido' ? 'Ver' : 'Responder'}</button></td></tr>)}
        {rows.length === 0 && <EmptyRow cols={7} loading={q.loading}>Sin reclamos.</EmptyRow>}</tbody></DataTable>
    {footer(`${q.data.length} registros`)}
    {open && <Modal kicker={open.number} title={`${open.type} de ${open.name}`} onClose={() => setOpen(null)} onSave={save} saveLabel="Responder">
      <Field label="Detalle" full><textarea rows={3} readOnly value={open.detail} /></Field>
      <Field label="Pedido del consumidor" full><textarea rows={2} readOnly value={open.requestText} /></Field>
      <Field label="Respuesta" full><textarea rows={4} value={text} onChange={e => setText(e.target.value)} /></Field></Modal>}
  </section>
}
