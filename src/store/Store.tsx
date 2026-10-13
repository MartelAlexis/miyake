import type { ReactElement } from 'react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Icon, type IconName } from '../shared/Icon'
import { PLACEHOLDER, money, placeOrder, shippingFor, useDB, type Order, type Product } from '../shared/db'

/* ---------- Carrito y favoritos (persisten en localStorage) ---------- */
function persisted<T>(key: string, initial: T) {
  const subs = new Set<() => void>()
  let raw = '', val = initial
  const get = () => {
    const r = localStorage.getItem(key) ?? ''
    if (r !== raw) { raw = r; try { val = r ? JSON.parse(r) : initial } catch { val = initial } }
    return val
  }
  const set = (v: T) => { localStorage.setItem(key, JSON.stringify(v)); subs.forEach(f => f()) }
  const sub = (f: () => void) => { subs.add(f); window.addEventListener('storage', f); return () => { subs.delete(f); window.removeEventListener('storage', f) } }
  return () => [useSyncExternalStore(sub, get), set] as const
}
const useCartStore = persisted<Record<string, number>>('gescom:cart', {})
const useWishStore = persisted<string[]>('gescom:wish', [])

/* ---------- Router por hash: #/ · #/catalogo · #/producto/ID · #/checkout · #/pedido/NUM ---------- */
function useRoute() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => { const f = () => { setH(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  const [path, qs] = h.split('?')
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs ?? '') }
}
const go = (to: string) => { location.hash = to }

const categories: [string, IconName][] = [['Impresoras', 'printer'], ['Punto de venta', 'grid'], ['Balanzas', 'chart'], ['Lectores', 'search'], ['Suministros', 'box']]

export default function Store() {
  const db = useDB()
  const route = useRoute()
  const [cart, setCart] = useCartStore()
  const [wish, setWish] = useWishStore()
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState('')
  const [q, setQ] = useState('')

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2400) }
  const products = db.products.filter(p => p.published)
  const lines = Object.entries(cart).map(([code, qty]) => ({ product: db.products.find(p => p.code === code), qty })).filter((l): l is { product: Product; qty: number } => !!l.product && l.product.stock > 0)
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0)

  const add = (p: Product, qty = 1) => {
    const have = cart[p.code] ?? 0
    if (have + qty > p.stock) return notify(`Solo hay ${p.stock} unidad(es) de este producto`)
    setCart({ ...cart, [p.code]: have + qty }); notify(`${p.description} agregado al carrito`)
  }
  const setQty = (code: string, qty: number, stock: number) => {
    const next = { ...cart }
    if (qty <= 0) delete next[code]; else next[code] = Math.min(qty, stock)
    setCart(next)
  }
  const toggleWish = (code: string) => setWish(wish.includes(code) ? wish.filter(c => c !== code) : [...wish, code])
  const card = (p: Product) => <ProductCard key={p.code} p={p} fav={wish.includes(p.code)} onFav={() => toggleWish(p.code)} onAdd={() => add(p)} />

  const [view, arg] = route.parts
  let body
  if (view === 'catalogo') body = <Catalog products={products} initialCat={route.query.get('cat') ?? 'Todos'} q={q} wish={wish} card={card} />
  else if (view === 'producto') {
    const p = products.find(x => x.code === arg)
    body = p ? <Detail p={p} related={products.filter(x => x.family === p.family && x.code !== p.code).slice(0, 4)} card={card} add={add} fav={wish.includes(p.code)} onFav={() => toggleWish(p.code)} /> : <Empty title="Producto no disponible" />
  } else if (view === 'checkout') body = <Checkout lines={lines} subtotal={subtotal} onDone={(o) => { setCart({}); go('/pedido/' + o.number) }} notify={notify} />
  else if (view === 'pedido') body = <OrderDone order={db.orders.find(o => o.number === arg)} />
  else body = <Home products={products} card={card} />

  return <div className="shop">
    <header>
      <div className="header-left"><a className="brand-link" href="#/"><span className="brand-mark">G</span><b>Miyake <small>Store</small></b></a></div>
      <label className="store-search"><Icon name="search" /><input value={q} onChange={e => { setQ(e.target.value); if (view !== 'catalogo') go('/catalogo') }} placeholder="¿Qué estás buscando hoy?" /></label>
      <div className="header-right">
        <div className="branch-pill"><span className="live-dot" /><div><span>Recojo en</span><b>Pueblo Libre</b></div></div>
        <button className="icon-button" aria-label="Favoritos" onClick={() => go('/catalogo?cat=Favoritos')}><Icon name="heart" />{wish.length > 0 && <i>{wish.length}</i>}</button>
        <button className="cart-button" onClick={() => setDrawer(true)}><Icon name="cart" /><span>Carrito</span>{count > 0 && <i>{count}</i>}</button>
      </div>
    </header>
    <main className="shop-main">{body}</main>
    <footer className="shop-footer"><span>© {new Date().getFullYear()} GesCOM · Tecnología para tu negocio</span><a href="/admin.html">Acceso administración →</a></footer>

    {drawer && <div className="modal-backdrop drawer-bg" onMouseDown={() => setDrawer(false)}>
      <aside className="drawer" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-head"><div><small>MI CARRITO</small><h2>{count} producto{count === 1 ? '' : 's'}</h2></div><button className="icon-button" onClick={() => setDrawer(false)}><Icon name="close" /></button></div>
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
          <button className="shop-now wide-btn" onClick={() => { setDrawer(false); go('/checkout') }}>Ir a pagar <Icon name="arrow-right" /></button></div>}
      </aside></div>}
    {toast && <div className="toast"><Icon name="check" />{toast}</div>}
  </div>
}

function Empty({ title, text }: { title: string; text?: string }) {
  return <div className="empty-catalog"><Icon name="search" size={34} /><h3>{title}</h3><p>{text ?? 'Prueba con otra búsqueda.'}</p><a className="text-action" href="#/catalogo">Ver catálogo</a></div>
}

function ProductCard({ p, fav, onFav, onAdd }: { p: Product; fav: boolean; onFav: () => void; onAdd: () => void }) {
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

function Home({ products, card }: { products: Product[]; card: (p: Product) => ReactElement }) {
  return <>
    <section className="commerce-hero"><div className="hero-copy"><span className="eyebrow">TECNOLOGÍA PARA TU NEGOCIO</span><h2>Todo para vender más, en un solo lugar.</h2><p>Equipa tu punto de venta con soluciones confiables, despacho rápido y soporte especializado.</p>
      <div className="hero-actions"><button className="shop-now" onClick={() => go('/catalogo')}>Comprar ahora <Icon name="arrow-right" /></button></div>
      <div className="hero-trust"><span><Icon name="truck" /> Envíos a todo el Perú</span><span><Icon name="check" /> Garantía asegurada</span></div></div>
      <div className="hero-visual"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85" onError={e => { e.currentTarget.style.display = 'none' }} alt="Soluciones para punto de venta" /><div className="floating-offer"><span>Hasta</span><b>20% OFF</b><small>en equipos POS</small></div></div></section>
    <section className="category-strip">{categories.map(([label, icon]) => <button key={label} onClick={() => go('/catalogo?cat=' + encodeURIComponent(label))}><span><Icon name={icon} /></span>{label}<Icon name="arrow-right" size={14} /></button>)}</section>
    <div className="store-section-head"><div><span>SELECCIÓN GESCOM</span><h3>Productos destacados</h3></div><button onClick={() => go('/catalogo')}>Ver todo <Icon name="arrow-right" size={16} /></button></div>
    <div className="product-grid featured">{[...products].sort((a, b) => b.rating - a.rating).slice(0, 4).map(card)}</div>
    <section className="commerce-benefits">{([['truck', 'Despacho rápido', 'Gratis desde S/ 500'], ['check', 'Compra protegida', 'Garantía en todos los equipos'], ['wallet', 'Pago flexible', 'Tarjeta, Yape y transferencia'], ['users', 'Soporte experto', 'Te ayudamos a elegir']] as [IconName, string, string][]).map(([i, t, s]) => <div key={t}><span><Icon name={i} /></span><div><b>{t}</b><small>{s}</small></div></div>)}</section>
  </>
}

function Catalog({ products, initialCat, q, wish, card }: { products: Product[]; initialCat: string; q: string; wish: string[]; card: (p: Product) => ReactElement }) {
  const [cat, setCat] = useState(initialCat)
  const [sort, setSort] = useState('rating')
  useEffect(() => setCat(initialCat), [initialCat])
  const fams = useMemo(() => ['Todos', ...Array.from(new Set(products.map(p => p.family))), 'Favoritos'], [products])
  const rows = products.filter(p => (cat === 'Todos' || (cat === 'Favoritos' ? wish.includes(p.code) : p.family === cat)) && Object.values(p).join(' ').toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sort === 'asc' ? a.price - b.price : sort === 'desc' ? b.price - a.price : b.rating - a.rating)
  return <>
    <div className="store-section-head"><div><span>CATÁLOGO</span><h3>{cat === 'Todos' ? 'Todos los productos' : cat}</h3></div></div>
    <div className="catalog-top"><div className="catalog-chips">{fams.map(f => <button className={cat === f ? 'active' : ''} key={f} onClick={() => setCat(f)}>{f}</button>)}</div>
      <label>Ordenar por <select value={sort} onChange={e => setSort(e.target.value)}><option value="rating">Mejor valorados</option><option value="asc">Menor precio</option><option value="desc">Mayor precio</option></select></label></div>
    <div className="product-grid">{rows.map(card)}</div>
    {rows.length === 0 && <Empty title="No encontramos productos" />}
  </>
}

function Detail({ p, related, card, add, fav, onFav }: { p: Product; related: Product[]; card: (p: Product) => ReactElement; add: (p: Product, q: number) => void; fav: boolean; onFav: () => void }) {
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

type Lines = { product: Product; qty: number }[]
function Checkout({ lines, subtotal, onDone, notify }: { lines: Lines; subtotal: number; onDone: (o: Order) => void; notify: (m: string) => void }) {
  const [f, setF] = useState({ name: '', doc: '', phone: '', email: '', delivery: 'Despacho' as 'Despacho' | 'Recojo', address: '', city: 'Lima', payment: 'Yape' })
  const [err, setErr] = useState<Record<string, string>>({})
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }))
  const shipping = shippingFor(subtotal, f.delivery, f.city)
  if (lines.length === 0) return <Empty title="Tu carrito está vacío" text="Agrega productos antes de pagar." />

  function submit() {
    const e: Record<string, string> = {}
    if (f.name.trim().length < 3) e.name = 'Ingresa tu nombre o razón social'
    if (!/^(\d{8}|\d{11})$/.test(f.doc)) e.doc = 'DNI (8 dígitos) o RUC (11 dígitos)'
    if (!/^9\d{8}$/.test(f.phone)) e.phone = 'Celular de 9 dígitos (empieza con 9)'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo no válido'
    if (f.delivery === 'Despacho' && f.address.trim().length < 5) e.address = 'Ingresa la dirección de entrega'
    setErr(e)
    if (Object.keys(e).length) return notify('Revisa los campos marcados')
    const r = placeOrder({ ...f, address: f.delivery === 'Recojo' ? 'Recojo en tienda Pueblo Libre' : f.address, items: lines.map(l => ({ code: l.product.code, description: l.product.description, qty: l.qty, price: l.product.price })) })
    if (r.ok) onDone(r.order); else notify(r.error)
  }
  const field = (k: keyof typeof f, label: string, ph = '', full = false) => <label className={full ? 'full' : ''}><span>{label}</span><input value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph} className={err[k] ? 'bad' : ''} />{err[k] && <em>{err[k]}</em>}</label>
  return <div className="checkout">
    <div className="panel pad"><h2>Datos de compra</h2>
      <div className="form-grid">
        {field('name', 'Nombre / Razón social', '', true)}{field('doc', 'DNI o RUC', '20123456789')}{field('phone', 'Celular', '987654321')}{field('email', 'Correo electrónico', 'tucorreo@empresa.com', true)}
        <label className="full"><span>Entrega</span><select value={f.delivery} onChange={e => set('delivery', e.target.value)}><option value="Despacho">Despacho a domicilio</option><option value="Recojo">Recojo en tienda (Pueblo Libre) · gratis</option></select></label>
        {f.delivery === 'Despacho' && <>{field('address', 'Dirección', 'Av. / Jr. / Calle y número', true)}{field('city', 'Ciudad')}</>}
        <label className="full"><span>Método de pago</span><select value={f.payment} onChange={e => set('payment', e.target.value)}><option>Yape</option><option>Transferencia</option><option>Tarjeta</option><option>Contra entrega</option></select></label>
      </div>
      <p className="note">Esta tienda es una demostración: no se realiza ningún cobro real.</p>
    </div>
    <aside className="panel pad summary"><h2>Resumen</h2>
      {lines.map(l => <div className="sum" key={l.product.code}><span>{l.qty} × {l.product.description}</span><b>{money(l.qty * l.product.price)}</b></div>)}
      <div className="sum"><span>Subtotal</span><b>{money(subtotal)}</b></div>
      <div className="sum"><span>Envío</span><b>{shipping ? money(shipping) : 'Gratis'}</b></div>
      <div className="sum total"><span>Total</span><b>{money(subtotal + shipping)}</b></div>
      <button className="shop-now wide-btn" onClick={submit}>Confirmar pedido <Icon name="check" /></button>
    </aside>
  </div>
}

function OrderDone({ order }: { order?: Order }) {
  if (!order) return <Empty title="Pedido no encontrado" />
  return <div className="panel pad done"><span className="done-icon"><Icon name="check" size={28} /></span>
    <h2>¡Gracias por tu compra, {order.name.split(' ')[0]}!</h2>
    <p>Tu pedido <b>{order.number}</b> fue registrado y está en estado <b>{order.status}</b>. {order.delivery === 'Recojo' ? 'Te avisaremos cuando esté listo para recoger en Pueblo Libre.' : `Lo enviaremos a ${order.address}, ${order.city}.`}</p>
    <div className="done-lines">{order.items.map(i => <div className="sum" key={i.code}><span>{i.qty} × {i.description}</span><b>{money(i.qty * i.price)}</b></div>)}<div className="sum total"><span>Total ({order.payment})</span><b>{money(order.total)}</b></div></div>
    <a className="shop-now" href="#/catalogo">Seguir comprando <Icon name="arrow-right" /></a></div>
}
