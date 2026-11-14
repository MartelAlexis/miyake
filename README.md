# Miyake

Tienda online + panel de administración (React 19, TypeScript, Vite, Tailwind 4).
Hoy funciona 100 % en el navegador (datos de ejemplo en `localStorage`); está organizado para conectar un backend sin tocar la UI.

## Ejecutar

```bash
npm install
npm run dev        # tienda: http://localhost:5173 · admin: http://localhost:5173/admin.html
npm run build
```

**Cuentas (modo demo)** — el acceso está visible en el encabezado de la tienda (*Ingresar* / *Crear cuenta*); cualquiera puede registrarse como cliente.

| Rol | Correo | Contraseña | Acceso |
|---|---|---|---|
| Cliente empresa | `cliente@empresa.pe` | `cliente123` | Tienda, Mi cuenta, Mis pedidos, Mis datos |
| Administrador | `admin@miyake.pe` | `admin123` | Tienda + panel completo |
| Cajero | `caja@miyake.pe` | `caja123` | Tienda + panel sin Productos, Clientes ni Almacén |

El panel (`/admin.html`) solo admite personal; un cliente que lo abra ve un aviso de "sin permisos". Hay un enlace "Acceso personal" en la barra superior y el pie de la tienda.

> En modo demo los usuarios viven en el navegador (localStorage): sirven para probar el flujo, **no protegen nada**. La seguridad real llega con el backend.

## Estructura

```
src/
├─ apps/
│  ├─ store/            Tienda pública (index.html)
│  │   ├─ pages/ components/ router.ts state.ts StoreApp.tsx
│  └─ admin/            Panel admin (admin.html), solo personal
│      ├─ pages/ components/ mock/ nav.ts AdminApp.tsx
├─ features/
│  └─ auth/             Sesión, <AuthProvider>, LoginForm, RegisterForm, permisos por rol
├─ services/            ← frontera con el backend
│  ├─ contracts.ts      Interfaces (qué necesita la UI)
│  ├─ local/            Implementación demo (localStorage)
│  ├─ api/              Implementación REST real
│  ├─ index.ts          Elige la implementación (VITE_DATA_SOURCE) y refresca datos tras escribir
│  └─ hooks.ts          useProducts(), useOrders()… que usa la UI
├─ core/                Tipos de dominio, config, cliente HTTP, sesión, utilidades
├─ shared/components/   Icon, Toast, Empty
└─ styles/              CSS global
docs/API.md             Contrato de endpoints que debe cumplir el backend
```

Regla de oro: **las pantallas solo importan de `services/` y `core/`**. Nunca tocan `localStorage` ni `fetch` directamente.

## Conectar el backend

1. Implementa los endpoints de [`docs/API.md`](docs/API.md).
2. Copia `.env.example` a `.env` y pon `VITE_DATA_SOURCE=api` (y `VITE_API_URL`).
3. Si tu backend usa otras rutas o formas de respuesta, ajusta **solo** `src/services/api/index.ts`.
4. Las reglas de negocio (stock, precios, permisos) deben vivir en el servidor; hoy las simula `src/services/local/`.

Pendiente de conectar (hoy son maquetas en `src/apps/admin/mock/`): caja, periodos de venta y movimientos de almacén.
