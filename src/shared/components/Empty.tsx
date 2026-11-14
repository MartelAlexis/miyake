import { Icon } from './Icon'

export function Empty({ title, text }: { title: string; text?: string }) {
  return <div className="empty-catalog"><Icon name="search" size={34} /><h3>{title}</h3><p>{text ?? 'Prueba con otra búsqueda.'}</p><a className="text-action" href="#/catalogo">Ver catálogo</a></div>
}
