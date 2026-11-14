/* Resultado explícito de operaciones que pueden fallar por reglas de negocio
   (stock insuficiente, código duplicado, credenciales inválidas...). */
export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string }
export const ok = <T = void>(data?: T): Result<T> => ({ ok: true, data: data as T })
export const fail = <T = void>(error: string): Result<T> => ({ ok: false, error })
