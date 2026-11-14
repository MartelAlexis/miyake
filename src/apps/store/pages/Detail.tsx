import { useState, type ReactElement } from 'react'
import { PLACEHOLDER, money } from '@/core/format'
import type { Product } from '@/core/types'
import { Icon } from '@/shared/components/Icon'

export function Detail({ p, related, card, add, fav, onFav }: { p: Product; related: Product[]; card: (p: Product) => ReactElement; add: (p: Product, q: number) => void; fav: boolean; onFav: () => void }) {
  const [qty, setQty] = useState(1)
  return <>
    <a className="back" href="#/catalogo">← Volver al catálogo</a>
    <section className="detail">
      <div className="detail-img"><img src={p.image} onError={e => { e.currentTarget.src = PLACEHOLDER }} alt={p.description} /></div>
      <div className="detail-info">
        <span className="product-family">{p.family} · {p.brand}</span><h1>{p.description}</h1>
        <div className="rating"><Icon name="star" size={14} /> <b>{p.rating}</b><span>· Modelo {p.model} · Cód. {p.code}</span></div>
        <div className="detail-price">{p.oldPrice > p.price && <small>{money(p.oldPrice)}</small>}<strong>{money(p.price)}</strong></div>
        <div className="stock-line">{p.stock > 0 ? <><span className="live-dot" /> {p.stock} disponibles para despacho o recojo en Pueblo Libre</> : 'Producto agotado'}</div>
        <div className="detail-actions">
          <div className="qty big"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(Math.min(p.stock, qty + 1))}>+</button></div>
          <button className="shop-now" disabled={p.stock < 1} onClick={() => add(p, qty)}><Icon name="cart" /> Agregar al carrito</button>
          <button className={`icon-button ${fav ? 'fav-on' : ''}`} onClick={onFav} aria-label="Favoritos"><Icon name="heart" /></button>
        </div>
        <ul className="detail-list"><li><Icon name="truck" size={15} /> Envío gratis desde S/ 500</li><li><Icon name="check" size={15} /> Garantía asegurada</li></ul>
      </div>
    </section>
    {related.length > 0 && <><div className="store-section-head"><div><span>TAMBIÉN TE PUEDE GUSTAR</span><h3>Productos relacionados</h3></div></div><div className="product-grid">{related.map(card)}</div></>}
  </>
}
