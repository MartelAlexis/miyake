import { useState } from 'react'
import { downloadCsv } from '@/core/csv'
import { money } from '@/core/format'
import type { Order, OrderStatus } from '@/core/types'
import { Icon } from '@/shared/components/Icon'
import { services } from '@/services'
import { useOrders } from '@/services/hooks'
import type { PageProps } from '../nav'
import { DataTable, EmptyRow, Field, match, Modal, QueryError, Status, Toolbar, usePager } from '../components/ui'

const flow: OrderStatus[] = ['Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado']

export function Orders({ search, setSearch, notify }: PageProps) {
  const q = useOrders()
  const [open, setOpen] = useState<Order | null>(null)
  const rows = q.data.filter(o => match([o.number, o.name, o.doc, o.status, o.payment], search))
  const { slice, footer } = usePager(rows)
  const exportCsv = () => downloadCsv('pedidos', ['Pedido', 'Fecha', 'Cliente', 'Documento', 'Pago', 'Entrega', 'Total', 'Estado'], rows.map(o => [o.number, o.date.slice(0, 10), o.name, o.doc, o.payment, o.delivery, o.total.toFixed(2), o.status]))
  const current = open && q.data.find(o => o.number === open.number)

  async function changeStatus(o: Order, status: OrderStatus) {
    const r = await services.orders.setStatus(o.number, status)
    notify(r.ok ? `Pedido ${status.toLowerCase()}` : r.error)
  }

  return <section className="panel"><Toolbar variant="stock" search={search} setSearch={setSearch} onExport={exportCsv} onRefresh={q.reload} notify={notify} />
    <QueryError error={q.error} retry={q.reload} />
    <DataTable><thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th>Entrega</th><th className="right">Total</th><th>Estado</th><th></th></tr></thead>
      <tbody>{slice.map(o => <tr key={o.number}><td><code>{o.number}</code></td><td>{o.date.slice(0, 10)}</td><td><b>{o.name}</b></td><td>{o.payment}</td><td>{o.delivery}</td><td className="right"><b>{money(o.total)}</b></td><td><Status green={o.status === 'Entregado'}>{o.status}</Status></td><td><button className="mini-btn" onClick={() => setOpen(o)}><Icon name="eye" size={14} /> Ver</button></td></tr>)}
        {rows.length === 0 && <EmptyRow cols={8} loading={q.loading}>Aún no hay pedidos. Haz una compra en la tienda y aparecerá aquí.</EmptyRow>}</tbody></DataTable>
    {footer(`${q.data.length} pedidos`)}
    {current && <Modal kicker={current.number} title={current.name} onClose={() => setOpen(null)} onSave={() => setOpen(null)} saveLabel="Cerrar">
      <div className="full" style={{ fontSize: 12, lineHeight: 1.7 }}>
        <div>{current.invoiceType ?? 'Boleta'} · Doc: <b>{current.doc}</b> · Cel: <b>{current.phone}</b> · {current.email}</div><div>{current.delivery}: {current.address}{current.delivery === 'Despacho' ? `, ${current.city}` : ''}</div>
        <div style={{ margin: '10px 0' }}>{current.items.map(i => <div key={i.code}>{i.qty} × {i.description} — {money(i.qty * i.price)}</div>)}</div>
        <div>Envío: {money(current.shipping)} · <b>Total: {money(current.total)}</b> ({current.payment})</div></div>
      <Field label="Estado del pedido" full><select value={current.status} onChange={e => changeStatus(current, e.target.value as OrderStatus)}>{flow.map(s => <option key={s}>{s}</option>)}</select></Field>
      <span className="full" style={{ fontWeight: 400 }}>Cancelar un pedido devuelve el stock y anula sus ventas.</span>
    </Modal>}
  </section>
}
