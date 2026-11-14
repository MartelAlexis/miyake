import { Icon } from '@/shared/components/Icon'

/* Maqueta: menú de tipos de movimiento de almacén (aún sin formulario ni servicio). */
export function MovementMenu({ items, type, notify }: { items: string[]; type: string; notify: (s: string) => void }) {
  return <section className="movement"><div className="movement-top"><button className="btn" onClick={() => notify('Menú cerrado')}><Icon name="close" /> Salir</button></div><div className="movement-intro"><h2>Selecciona un tipo de {type.toLowerCase()}</h2><p>Elige la operación que deseas registrar en el almacén Pueblo Libre.</p></div><div className="movement-grid">{items.map((item, i) => <button key={item} onClick={() => notify(`${item}: formulario listo para registrar`)}><span className={`movement-icon ${i % 4}`}><Icon name={type === 'Ingreso' ? 'arrow-in' : 'arrow-out'} /></span><div><b>{item}</b><small>Crear nuevo movimiento</small></div><span className="movement-arrow">→</span></button>)}<button className="exit-card" onClick={() => notify('Saliendo del menú')}><span className="movement-icon"><Icon name="close" /></span><div><b>Salir del menú</b><small>Volver al dashboard</small></div></button></div></section>
}
