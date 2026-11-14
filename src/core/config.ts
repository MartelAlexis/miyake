/* Configuración central. Todo lo que cambia entre entornos vive aquí (variables VITE_*). */
const env = import.meta.env

export const config = {
  /** 'local' = datos en localStorage (demo) · 'api' = backend real vía HTTP */
  dataSource: (env.VITE_DATA_SOURCE === 'api' ? 'api' : 'local') as 'local' | 'api',
  apiUrl: (env.VITE_API_URL ?? '/api').replace(/\/$/, ''),
  /** Duración de la sesión en modo local. Con backend la define el servidor (expiresAt). */
  sessionHours: 8,
} as const
