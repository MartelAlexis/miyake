import { useState } from 'react'
import { downloadCsv } from '@/core/csv'
import { money } from '@/core/format'
import { useProducts } from '@/services/hooks'
import type { PageProps } from '../nav'
import { DataTable, match, QueryError, Toolbar, usePager } from '../components/ui'

export function Stock({ search, setSearch, notify, exitTo }: PageProps) {
  const q = useProducts()
  const [onlyStock, setOnly] = useState(false)
  const rows = q.data.filter(p => (!onlyStock || p.stock > 0) && match(Object.values(p), search))
  const { slice, footer } = usePager(rows)
  const value = rows.reduce((a, p) => a + p.stock * p.cost, 0)
  const exportCsv = () => downloadCsv('stock-valorizado', ['Código', 'Descripción', 'Stock', 'Costo', 'Valor'], rows.map(p => [p.code, p.description, p.stock, p.cost.toFixed(2), (p.stock * p.cost).toFixed(2)]))
  return <section className="panel"><Toolbar variant="stock" search={search} setSearch={setSearch} onExport={exportCsv} onRefresh={q.reload} onExit={exitTo} notify={notify} /><div className="table-controls"><label><input type="checkbox" checked={onlyStock} onChange={e => setOnly(e.target.checked)} /> Mostrar solo productos con stock mayor a cero</label></div>
    <QueryError error={q.error} retry={q.reload} />
    <DataTable><thead><tr><th>Código</th><th>Familia</th><th>Marca</th><th>Descripción</th><th className="right">Stock</th><th className="right">Costo</th><th className="right">Valor stock</th><th className="right">Precio venta</th></tr></thead>
      <tbody>{slice.map(p => <tr key={p.code}><td><code>{p.code}</code></td><td>{p.family}</td><td>{p.brand}</td><td><b>{p.description}</b></td><td className="right"><b>{p.stock}</b></td><td className="right">{money(p.cost)}</td><td className="right">{money(p.stock * p.cost)}</td><td className="right">{money(p.price)}</td></tr>)}</tbody></DataTable>
    {footer(`Valor total: ${money(value)}`)}</section>
}
