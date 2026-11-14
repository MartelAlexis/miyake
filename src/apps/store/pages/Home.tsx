import type { ReactElement } from 'react'
import type { Product } from '@/core/types'
import { Icon, type IconName } from '@/shared/components/Icon'
import { categories } from '../categories'
import { go } from '../router'

export function Home({ products, card }: { products: Product[]; card: (p: Product) => ReactElement }) {
  return <>
    <section className="commerce-hero"><div className="hero-copy"><span className="eyebrow">TECNOLOGÍA PARA TU NEGOCIO</span><h2>Todo para vender más, en un solo lugar.</h2><p>Equipa tu punto de venta con soluciones confiables, despacho rápido y soporte especializado.</p>
      <div className="hero-actions"><button className="shop-now" onClick={() => go('/catalogo')}>Comprar ahora <Icon name="arrow-right" /></button></div>
      <div className="hero-trust"><span><Icon name="truck" /> Envíos a todo el Perú</span><span><Icon name="check" /> Garantía asegurada</span></div></div>
      <div className="hero-visual"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85" onError={e => { e.currentTarget.style.display = 'none' }} alt="Soluciones para punto de venta" /><div className="floating-offer"><span>Hasta</span><b>20% OFF</b><small>en equipos POS</small></div></div></section>
    <section className="category-strip">{categories.map(([label, icon]) => <button key={label} onClick={() => go('/catalogo?cat=' + encodeURIComponent(label))}><span><Icon name={icon} /></span>{label}<Icon name="arrow-right" size={14} /></button>)}</section>
    <div className="store-section-head"><div><span>SELECCIÓN MIYAKE</span><h3>Productos destacados</h3></div><button onClick={() => go('/catalogo')}>Ver todo <Icon name="arrow-right" size={16} /></button></div>
    <div className="product-grid featured">{[...products].sort((a, b) => b.rating - a.rating).slice(0, 4).map(card)}</div>
    <section className="commerce-benefits">{([['truck', 'Despacho rápido', 'Gratis desde S/ 500'], ['check', 'Compra protegida', 'Garantía en todos los equipos'], ['wallet', 'Pago flexible', 'Tarjeta, Yape y transferencia'], ['users', 'Soporte experto', 'Te ayudamos a elegir']] as [IconName, string, string][]).map(([i, t, s]) => <div key={t}><span><Icon name={i} /></span><div><b>{t}</b><small>{s}</small></div></div>)}</section>
  </>
}
