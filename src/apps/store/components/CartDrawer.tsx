import { PLACEHOLDER, money } from '@/core/format'
import type { Product } from '@/core/types'
import { Empty } from '@/shared/components/Empty'
import { Icon } from '@/shared/components/Icon'

export type CartLine = { product: Product; qty: number }

export function CartDrawer({ lines, count, subtotal, setQty, onClose, onCheckout }: { lines: CartLine[]; count: number; subtotal: number; setQty: (code: string, qty: number, stock: number) => void; onClose: () => void; onCheckout: () => void }) {
  return <div className="modal-backdrop drawer-bg" onMouseDown={onClose}>
    <aside className="drawer" onMouseDown={e => e.stopPropagation()}>
      <div className="modal-head"><div><small>MI CARRITO</small><h2>{count} producto{count === 1 ? '' : 's'}</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div>
      <div className="drawer-body">
        {lines.length === 0 && <Empty title="Tu carrito está vacío" text="Agrega productos para continuar." />}
        {lines.map(({ product: p, qty }) => <div className="cart-line" key={p.code}>
          <img src={p.image} onError={e => { e.currentTarget.src = PLACEHOLDER }} alt="" />
          <div><b>{p.description}</b><small>{money(p.price)} c/u</small>
            <div className="qty"><button onClick={() => setQty(p.code, qty - 1, p.stock)}>−</button><span>{qty}</span><button onClick={() => setQty(p.code, qty + 1, p.stock)} disabled={qty >= p.stock}>+</button></div></div>
          <div className="cart-line-end"><b>{money(p.price * qty)}</b><button className="icon-button" aria-label="Quitar" onClick={() => setQty(p.code, 0, p.stock)}><Icon name="trash" size={15} /></button></div>
        </div>)}
      </div>
      {lines.length > 0 && <div className="drawer-foot"><div className="sum"><span>Subtotal</span><b>{money(subtotal)}</b></div><small>Envío calculado en el siguiente paso</small>
        <button className="shop-now wide-btn" onClick={onCheckout}>Ir a pagar <Icon name="arrow-right" /></button></div>}
    </aside></div>
}
