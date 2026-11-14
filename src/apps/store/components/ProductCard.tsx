import { PLACEHOLDER, money } from '@/core/format'
import type { Product } from '@/core/types'
import { Icon } from '@/shared/components/Icon'

export function ProductCard({ p, fav, onFav, onAdd }: { p: Product; fav: boolean; onFav: () => void; onAdd: () => void }) {
  const discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
  return <article className="product-card">
    <a className="product-image" href={`#/producto/${p.code}`}>
      {discount > 0 && <span className="discount">-{discount}%</span>}
      <img src={p.image} onError={e => { e.currentTarget.src = PLACEHOLDER }} alt={p.description} />
    </a>
    <button className={`wish ${fav ? 'on' : ''}`} aria-label="Favoritos" onClick={onFav}><Icon name="heart" size={17} /></button>
    <div className="product-info">
      <span className="product-family">{p.family}</span><h4><a href={`#/producto/${p.code}`}>{p.description}</a></h4>
      <div className="rating"><Icon name="star" size={13} /> <b>{p.rating}</b></div>
      <div className="stock-line">{p.stock > 0 ? <><span className="live-dot" /> {p.stock <= 5 ? `¡Últimas ${p.stock} unidades!` : 'Stock disponible'}</> : 'Agotado'}</div>
      <div className="product-buy"><div>{p.oldPrice > p.price && <small>{money(p.oldPrice)}</small>}<strong>{money(p.price)}</strong></div>
        <button disabled={p.stock < 1} onClick={onAdd} aria-label={`Agregar ${p.description} al carrito`}><Icon name="cart" /></button></div>
    </div>
  </article>
}
