import { fail, type Result } from '@/core/result'

/* Convierte errores HTTP en Result para que la UI los muestre igual que en modo local. */
export async function attempt<T = void>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try { return await fn() } catch (e) { return fail<T>(e instanceof Error ? e.message : 'Error inesperado') }
}
