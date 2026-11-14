import { config } from './config'
import { clearSession, getSession } from './session'

/* Cliente HTTP único. Agrega el token, normaliza errores y cierra la sesión si el backend responde 401. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}

type Init = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown }

export async function http<T>(path: string, { method = 'GET', body }: Init = {}): Promise<T> {
  const token = getSession()?.token
  let res: Response
  try {
    res = await fetch(config.apiUrl + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }
  if (res.status === 401 && token) clearSession() // sesión vencida o token inválido
  if (!res.ok) {
    let msg = res.statusText || 'Error del servidor'
    try { const j = await res.json(); msg = j.message ?? j.error ?? msg } catch { /* sin cuerpo JSON */ }
    throw new ApiError(res.status, msg)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}
