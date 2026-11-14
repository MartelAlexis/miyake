import { useState } from 'react'
import type { Product } from '@/core/types'
import { Empty } from '@/shared/components/Empty'
import { Icon } from '@/shared/components/Icon'
import { useToast } from '@/shared/components/Toast'
import { useAuth } from '@/features/auth/AuthProvider'
import { useProducts } from '@/services/hooks'
import { CartDrawer, type CartLine } from './components/CartDrawer'
import { ProductCard } from './components/ProductCard'
import { Account } from './pages/Account'
import { AuthPage } from './pages/AuthPage'
import { Catalog } from './pages/Catalog'
import { Checkout } from './pages/Checkout'
import { Detail } from './pages/Detail'
import { Home } from './pages/Home'
import { OrderDone } from './pages/OrderDone'
import { SiteFooter, TopBar, AccountArea, CategoryNav } from './components/SiteChrome'
import { go, useRoute } from './router'
import { useCartStore, useWishStore } from './state'

export default function StoreApp() {
  const route = useRoute()
  const { user, logout } = useAuth()
  const { data: products, loading } = useProducts(true) // solo publicados
  const [cart, setCart] = useCartStore()
  const [wish, setWish] = useWishStore()
  const [drawer, setDrawer] = useState(false)
  const [q, setQ] = useState('')
  const { notify, toast } = useToast()

  const lines = Object.entries(cart).map(([code, qty]) => ({ product: products.find(p => p.code === code), qty })).filter((l): l is CartLine => !!l.product && l.product.stock > 0)
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
  if (view === 'catalogo') body = <Catalog products={products} loading={loading} initialCat={route.query.get('cat') ?? 'Todos'} q={q} wish={wish} card={card} />
  else if (view === 'producto') {
    const p = products.find(x => x.code === arg)
    body = p ? <Detail p={p} related={products.filter(x => x.family === p.family && x.code !== p.code).slice(0, 4)} card={card} add={add} fav={wish.includes(p.code)} onFav={() => toggleWish(p.code)} /> : loading ? <p style={{ textAlign: 'center', padding: 40 }}>Cargando…</p> : <Empty title="Producto no disponible" />
  } else if (view === 'checkout') body = <Checkout lines={lines} subtotal={subtotal} onDone={o => { setCart({}); go('/pedido/' + o.number) }} notify={notify} />
  else if (view === 'pedido') body = <OrderDone number={arg ?? ''} />
  else if (view === 'login' || view === 'registro') body = <AuthPage mode={view === 'login' ? 'login' : 'register'} next={route.query.get('next')} />
  else if (view === 'cuenta') body = user && user.role === 'cliente' ? <Account tab={arg === 'datos' ? 'datos' : 'pedidos'} notify={notify} /> : <AuthPage mode="login" next="/cuenta" />
  else body = <Home products={products} card={card} />

  const activeCat = view === 'catalogo' ? (route.query.get('cat') ?? 'Todos') : ''

  return <div className="shop">
    <TopBar />
    <div className="shop-sticky">
      <header>
        <div className="header-left"><a className="brand-link" href="#/"><span className="brand-mark">M</span><b>Miyake <small>Store</small></b></a></div>
        <label className="store-search"><Icon name="search" /><input value={q} onChange={e => { setQ(e.target.value); if (view !== 'catalogo') go('/catalogo') }} placeholder="Busca por producto, marca o modelo…" /></label>
        <div className="header-right">
          <AccountArea user={user} onLogout={() => { logout(); if (view === 'cuenta') go('/') }} />
          <button className="icon-button" aria-label="Favoritos" onClick={() => go('/catalogo?cat=Favoritos')}><Icon name="heart" />{wish.length > 0 && <i>{wish.length}</i>}</button>
          <button className="cart-button" onClick={() => setDrawer(true)}><Icon name="cart" /><span>Carrito</span>{count > 0 && <i>{count}</i>}</button>
        </div>
      </header>
      <CategoryNav current={activeCat} />
    </div>
    <main className="shop-main">{body}</main>
    <SiteFooter />
    {drawer && <CartDrawer lines={lines} count={count} subtotal={subtotal} setQty={setQty} onClose={() => setDrawer(false)} onCheckout={() => { setDrawer(false); go('/checkout') }} />}
    {toast}
  </div>
}
