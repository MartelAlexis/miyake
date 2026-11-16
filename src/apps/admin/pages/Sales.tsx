import { useState } from 'react'
import { downloadCsv } from '@/core/csv'
import { money } from '@/core/format'
import { services } from '@/services'
import { useProducts, useSales } from '@/services/hooks'
import type { PageProps } from '../nav'
import { DataTable, EmptyRow, Field, match, Modal, QueryError, Status, Toolbar, usePager } from '../components/ui'

export function Sales({ search, setSearch, notify, exitTo }: PageProps) {
  const q = useSales()
  const products = useProducts().data
  const [from, setFrom] = useState(''), [to, setTo] = useState('')
  const [modal, setModal] = useState(false)
  const [sel, setSel] = useState({ code: '', qty: 1 })
  const rows = q.data.filter(s => match([s.id, s.description, s.docRef, s.channel, s.code], search) && (!from || s.date >= from) && (!to || s.date <= to))
  const { slice, footer } = usePager(rows)
  const total = rows.filter(s => s.status === 'Emitida').reduce((a, s) => a + s.amount, 0)
  const exportCsv = () => downloadCsv('ventas', ['Documento', 'Fecha', 'Código', 'Descripción', 'Cantidad', 'Precio', 'Importe', 'Canal', 'Estado'], rows.map(s => [s.docRef, s.date, s.code, s.description, s.qty, s.price.toFixed(2), s.amount.toFixed(2), s.channel, s.status]))
  const exportDataset = async () => {
    try {
      const csv = await services.sales.exportDataset!()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
      a.download = 'ventas_detalle.csv'; a.click(); URL.revokeObjectURL(a.href)
    } catch (e) { notify(e instanceof Error ? e.message : 'No se pudo exportar') }
  }
  const save = async () => {
    const r = await services.sales.counterSale(sel.code, sel.qty)
    if (!r.ok) return notify(r.error)
    setModal(false); notify('Venta registrada y stock actualizado')
  }
  return <section className="panel"><Toolbar variant="ventas" search={search} setSearch={setSearch} onExport={exportCsv} onRefresh={q.reload} onAdd={() => { setSel({ code: products.find(p => p.stock > 0)?.code ?? '', qty: 1 }); setModal(true) }} onExit={exitTo} notify={notify} />
    <div className="filter-row"><label>Desde <input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label><label>Hasta <input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>{services.sales.exportDataset && <button className="btn" onClick={exportDataset}>Exportar dataset (ventas_detalle)</button>}</div>
    <QueryError error={q.error} retry={q.reload} />
    <DataTable><thead><tr><th>Documento</th><th>Fecha</th><th>Código</th><th>Descripción</th><th className="right">Cant.</th><th className="right">Precio</th><th className="right">Importe</th><th>Canal</th><th>Estado</th></tr></thead>
      <tbody>{slice.map(s => <tr key={s.id} style={s.status === 'Anulada' ? { opacity: .5 } : undefined}><td><code>{s.docRef}</code></td><td>{s.date}</td><td>{s.code}</td><td><b>{s.description}</b></td><td className="right">{s.qty}</td><td className="right">{money(s.price)}</td><td className="right"><b>{money(s.amount)}</b></td><td>{s.channel}</td><td><Status green={s.status === 'Emitida'}>{s.status}</Status></td></tr>)}
        {rows.length === 0 && <EmptyRow cols={9} loading={q.loading}>Sin ventas en este filtro.</EmptyRow>}</tbody></DataTable>
    {footer(`Total: ${money(total)}`)}
    {modal && <Modal kicker="VENTA DE MOSTRADOR" title="Nueva venta" onClose={() => setModal(false)} onSave={save}>
      <Field label="Producto" full><select value={sel.code} onChange={e => setSel({ ...sel, code: e.target.value })}>{products.map(p => <option key={p.code} value={p.code} disabled={p.stock < 1}>{p.description} — {money(p.price)} (stock {p.stock})</option>)}</select></Field>
      <Field label="Cantidad"><input type="number" min={1} value={sel.qty} onChange={e => setSel({ ...sel, qty: Number(e.target.value) })} /></Field></Modal>}
  </section>
}
