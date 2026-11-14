import { Icon } from '@/shared/components/Icon'
import { periods } from '../mock/data'
import type { PageProps } from '../nav'
import { DataTable, match, Status, TableFooter, Toolbar } from '../components/ui'

/* Maqueta estática: aún sin servicio de periodos (ver mock/data.ts). */
export function Periods({ search, setSearch, notify }: Omit<PageProps, 'exitTo'>) {
  const rows = periods.filter(r => match(r, search))
  return <section className="panel"><Toolbar variant="periodos" search={search} setSearch={setSearch} onExport={() => notify('Sin datos reales de periodos aún')} onAdd={() => notify('Nueva fecha de sistema creada')} notify={notify} />
    <div className="print-option"><label>Opciones de impresión <select onChange={() => notify('Opción de impresión seleccionada')}><option>Periodo venta</option><option>Resumen de cierre</option><option>Stock del periodo</option></select></label></div>
    <DataTable><thead><tr><th>Día</th><th>Fecha sistema</th><th>Fecha apertura</th><th>Estado</th><th>Usuario apertura</th><th>Válida</th><th className="right">Stock inicial</th><th>Almacén default</th><th>Acción</th></tr></thead><tbody>{rows.map(r => <tr key={r[1]}><td>{r[0]}</td><td><b>{r[1]}</b></td><td>{r[1]}</td><td><Status green={r[2] === 'Abierto'}>{r[2]}</Status></td><td>{r[3]}</td><td><Icon name="check" /></td><td className="right"><b>{r[4]}</b></td><td>{r[5]}</td><td><button className="mini-btn"><Icon name="printer" size={14} /> Imprimir</button></td></tr>)}</tbody></DataTable><TableFooter count={rows.length} total="Periodos registrados" /></section>
}
