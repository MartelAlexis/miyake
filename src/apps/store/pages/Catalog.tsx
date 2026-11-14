import { useEffect, useMemo, useState, type ReactElement } from 'react'
import type { Product } from '@/core/types'
import { Empty } from '@/shared/components/Empty'

export function Catalog({ products, loading, initialCat, q, wish, card }: { products: Product[]; loading: boolean; initialCat: string; q: string; wish: string[]; card: (p: Product) => ReactElement }) {
  const [cat, setCat] = useState(initialCat)
  const [sort, setSort] = useState('rating')
  useEffect(() => setCat(initialCat), [initialCat])
  const fams = useMemo(() => ['Todos', ...Array.from(new Set(products.map(p => p.family))), 'Ofertas', 'Favoritos'], [products])
  const rows = products.filter(p => (cat === 'Todos' || (cat === 'Favoritos' ? wish.includes(p.code) : cat === 'Ofertas' ? p.oldPrice > p.price : p.family === cat)) && Object.values(p).join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : b.rating - a.rating)
  return <>
    <div className="store-section-head"><div><span>CATÁLOGO</span><h3>{cat === 'Todos' ? 'Todos los productos' : cat}</h3></div></div>
    <div className="catalog-top"><div className="catalog-chips">{fams.map(f => <button className={cat === f ? 'active' : ''} key={f} onClick={() => setCat(f)}>{f}</button>)}</div>
      <label>Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="rating">Mejor valorados</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option></select></label></div>
    <div className="product-grid">{rows.map(card)}</div>
    {rows.length === 0 && (loading ? <p style={{ textAlign: 'center', padding: 40 }}>Cargando catálogo…</p> : <Empty title="No encontramos productos" />)}
  </>
}
