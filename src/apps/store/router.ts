import { useEffect, useState } from 'react'

/* Router por hash: #/ · #/catalogo · #/producto/ID · #/checkout · #/pedido/NUM */
export function useRoute() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const f = () => { setH(location.hash.slice(1) || '/'); window.scrollTo(0, 0) }
    addEventListener('hashchange', f); return () => removeEventListener('hashchange', f)
  }, [])
  const [path, qs] = h.split('?')
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs ?? '') }
}
export const go = (to: string) => { location.hash = to }
