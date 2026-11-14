import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from '@/shared/components/Icon'

export const match = (row: unknown[], q: string) => row.join(' ').toLowerCase().includes(q.toLowerCase())

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="table-wrap"><table>{children}</table></div>
}

export function Status({ children, green = false }: { children: ReactNode; green?: boolean }) {
  return <span className={`status ${green ? 'green' : ''}`}>{children}</span>
}

export function TableFooter({ count, total }: { count: number; total: string }) {
  return <div className="table-footer"><span>Mostrando <b>{count}</b> registros</span><span>{total}</span></div>
}

export function usePager<T>(rows: T[], size = 10) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const cur = Math.min(page, pages)
  const slice = rows.slice((cur - 1) * size, cur * size)
  const footer = (total: string) => <div className="table-footer"><span>Mostrando <b>{slice.length}</b> de {rows.length}</span><span>{total}</span>
    <div><button disabled={cur === 1} onClick={() => setPage(cur - 1)}>‹</button><button className="selected">{cur}/{pages}</button><button disabled={cur === pages} onClick={() => setPage(cur + 1)}>›</button></div></div>
  return { slice, footer }
}

export function Modal({ title, kicker, onClose, onSave, saveLabel = 'Guardar', children }: { title: string; kicker: string; onClose: () => void; onSave: () => void; saveLabel?: string; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}>
    <div className="modal-head"><div><small>{kicker}</small><h2>{title}</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div>
    <div className="form-grid">{children}</div>
    <div className="modal-foot"><button className="btn" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={onSave}><Icon name="check" /> {saveLabel}</button></div>
  </div></div>
}

export const Field = ({ label, full, children }: { label: string; full?: boolean; children: ReactNode }) => <label className={full ? 'full' : ''}><span>{label}</span>{children}</label>

/* Estado de una consulta: error con reintento. Las páginas lo ponen encima de la tabla. */
export function QueryError({ error, retry }: { error: string; retry: () => void }) {
  if (!error) return null
  return <div className="query-error" role="alert"><span>{error}</span><button className="mini-btn" onClick={retry}><Icon name="refresh" size={14} /> Reintentar</button></div>
}

export function EmptyRow({ cols, loading, children }: { cols: number; loading: boolean; children: ReactNode }) {
  return <tr><td colSpan={cols} style={{ textAlign: 'center', padding: 40 }}>{loading ? 'Cargando…' : children}</td></tr>
}

/* ---------- Toolbar ---------- */
const toolbarOptions = {
  ventas: ['Nueva venta', 'Exportar', 'Imprimir', 'Salir'],
  productos: ['Nuevo', 'Refrescar', 'Exportar', 'Imprimir', 'Cerrar'],
  clientes: ['Nuevo', 'Refrescar', 'Exportar', 'Imprimir', 'Cerrar'],
  caja: ['Ingresos', 'Egresos', 'Cuadre', 'Refrescar', 'Filtros', 'Diseñar', 'Imprimir', 'Exportar', 'Cerrar'],
  periodos: ['Nueva fecha', 'Reabrir', 'Cerrar', 'Refrescar', 'Imprimir', 'Salir'],
  stock: ['Exportar', 'Imprimir', 'Salir'],
}

function actionIcon(label: string): IconName {
  if (['Nuevo', 'Nueva fecha', 'Nueva venta', 'Ingresos'].includes(label)) return 'plus'
  if (['Editar', 'Diseñar'].includes(label)) return 'edit'
  if (['Eliminar', 'Egresos'].includes(label)) return 'trash'
  if (label === 'Exportar') return 'download'
  if (['Imprimir', 'BarCode'].includes(label)) return 'printer'
  if (['Filtros', 'Filtrar'].includes(label)) return 'filter'
  if (['Refrescar', 'Reabrir'].includes(label)) return 'refresh'
  if (['Cerrar', 'Salir'].includes(label)) return 'close'
  if (['Graficar', 'Cuadre'].includes(label)) return 'chart'
  if (label === 'Imagen') return 'eye'
  return 'layers'
}

export function Toolbar({ variant, onAdd, onExit, onExport, onRefresh, search, setSearch, notify }: { onExit?: () => void; variant: keyof typeof toolbarOptions; onAdd?: () => void; onExport: () => void; onRefresh?: () => void; search: string; setSearch: (v: string) => void; notify: (s: string) => void }) {
  const run = (label: string) => {
    if (['Nuevo', 'Nueva fecha', 'Nueva venta'].includes(label)) return onAdd?.()
    if (['Cerrar', 'Salir'].includes(label) && onExit) return onExit()
    if (label === 'Exportar') return onExport()
    if (label === 'Imprimir') return window.print()
    if (label === 'Refrescar') { setSearch(''); onRefresh?.(); return notify('Información actualizada') }
    notify(`${label}: opción activada`)
  }
  return <div className="toolbar">
    <div className="toolbar-actions">
      {toolbarOptions[variant].map((label, index) => <button key={label} className={`btn ${index === 0 && ['productos', 'clientes', 'caja', 'periodos', 'ventas'].includes(variant) ? 'btn-primary' : ''}`} onClick={() => run(label)}><Icon name={actionIcon(label)} />{label}</button>)}
    </div>
    <label className="search"><Icon name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar en registros..." /></label>
  </div>
}
