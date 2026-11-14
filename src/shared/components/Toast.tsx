import { useCallback, useState } from 'react'
import { Icon } from './Icon'

/* Aviso temporal. Uso: const { notify, toast } = useToast() ... {toast} */
export function useToast() {
  const [msg, setMsg] = useState('')
  const notify = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2400) }, [])
  const toast = msg ? <div className="toast"><Icon name="check" />{msg}</div> : null
  return { notify, toast }
}
