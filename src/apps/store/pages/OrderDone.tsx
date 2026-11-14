import { money } from '@/core/format'
import { Empty } from '@/shared/components/Empty'
import { Icon } from '@/shared/components/Icon'
import { useOrder } from '@/services/hooks'

export function OrderDone({ number }: { number: string }) {
  const { data: order, loading } = useOrder(number)
  if (loading) return <p style={{ textAlign: 'center', padding: 40 }}>Cargando pedido…</p>
  if (!order) return <Empty title="Pedido no encontrado" />
  return <div className="panel pad done"><span className="done-icon"><Icon name="check" size={28} /></span>
    <h2>¡Gracias por tu compra, {order.name.split(' ')[0]}!</h2>
    <p>Tu pedido <b>{order.number}</b> fue registrado y está en estado <b>{order.status}</b>. {order.delivery === 'Recojo' ? 'Te avisaremos cuando esté listo para recoger en Pueblo Libre.' : `Lo enviaremos a ${order.address}, ${order.city}.`}</p>
    <div className="done-lines">{order.items.map(i => <div className="sum" key={i.code}><span>{i.qty} × {i.description}</span><b>{money(i.qty * i.price)}</b></div>)}<div className="sum total"><span>Total ({order.payment})</span><b>{money(order.total)}</b></div></div>
    <a className="shop-now" href="#/catalogo">Seguir comprando <Icon name="arrow-right" /></a></div>
}
