import { useCallback, useEffect, useRef, useState } from 'react'

/* Mini "react-query": carga datos asíncronos y se refresca cuando alguien llama invalidate().
   Si luego prefieres TanStack Query, solo hay que reemplazar este archivo y src/services/hooks.ts. */

type Listener = { key: string; run: () => void }
const listeners = new Set<Listener>()

/** Refresca todas las consultas cuya clave empiece por alguno de los prefijos. */
export function invalidate(...prefixes: string[]) {
  listeners.forEach(l => { if (prefixes.some(p => l.key.startsWith(p))) l.run() })
}
export const invalidateAll = () => listeners.forEach(l => l.run())

export function useQuery<T>(key: string, fetcher: () => Promise<T>, initial: T) {
  const [state, setState] = useState({ data: initial, loading: true, error: '' })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const seq = useRef(0)

  const run = useCallback(() => {
    const id = ++seq.current
    fetcherRef.current().then(
      data => { if (id === seq.current) setState({ data, loading: false, error: '' }) },
      (e: unknown) => { if (id === seq.current) setState(s => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Error al cargar datos' })) },
    )
  }, [])

  useEffect(() => {
    const l = { key, run }
    listeners.add(l); run()
    return () => { listeners.delete(l); seq.current++ }
  }, [key, run])

  return { ...state, reload: run }
}
