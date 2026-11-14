# Contrato del backend (REST + JSON)

Es lo que espera `src/services/api/index.ts`. Los tipos exactos están en `src/core/types.ts`.
Base URL: `VITE_API_URL` (por defecto `/api`). Cuerpo y respuestas en JSON.
Rutas protegidas: cabecera `Authorization: Bearer <token>`. Errores: HTTP 4xx/5xx con `{ "message": "texto para el usuario" }`.

| Método | Ruta | Auth | Cuerpo | Respuesta |
|---|---|---|---|---|
| POST | `/auth/login` | pública | `{ email, password }` | `Session` → `{ token, expiresAt, user: { id, name, email, role } }` · 401 si es inválido |
| POST | `/auth/register` | pública | `RegisterInput` `{ name, email, password, company?, doc?, phone? }` | `Session` · 409 si el correo existe. **El servidor asigna siempre `role: 'cliente'`** |
| PUT | `/auth/me` | token | `ProfileInput` `{ name, company, doc, phone, address, city }` | `User` actualizado |
| POST | `/auth/logout` | token | – | 204 |
| GET | `/products?published=true` | **pública** con `published=true`; sin el filtro requiere token | – | `Product[]` |
| POST | `/products` | admin | `Product` | 201 · 409 si el código ya existe |
| PUT | `/products/:code` | admin | `Product` | 200 |
| DELETE | `/products/:code` | admin | – | 204 |
| GET | `/clients` | admin | – | `Client[]` |
| POST / PUT / DELETE | `/clients[/:code]` | admin | `Client` | igual que productos |
| GET | `/orders` | admin / cajero | – | `Order[]` |
| GET | `/orders/mine` | cliente | – | `Order[]` solo del usuario del token |
| GET | `/orders/:number` | pública*  | – | `Order` · 404 si no existe |
| POST | `/orders` | **pública** (tienda) | `OrderInput` | `Order` · 409 si no hay stock |
| PATCH | `/orders/:number/status` | admin / cajero | `{ status }` | 200 |
| GET | `/sales` | admin / cajero | – | `Sale[]` |
| POST | `/sales/counter` | admin / cajero | `{ code, qty }` | 200 · 409 si no hay stock |

\* `GET /orders/:number` es público para que el cliente vea su confirmación. En producción conviene exigir un token
de pedido (o devolver solo datos mínimos), porque contiene datos personales.

## Reglas que DEBE aplicar el servidor (hoy las simula `src/services/local`)

- **Precios y envío**: recalcularlos en el servidor; ignorar los precios que envíe el navegador.
- **Stock**: validar y descontar de forma atómica (transacción) al crear un pedido; devolverlo al cancelar.
- **Ventas**: generar una venta por cada ítem del pedido; anularlas al cancelar.
- **Pedido ↔ cliente**: si la petición trae token de cliente, guardar `userId` en el pedido (el cliente nunca lo envía). `invoiceType = 'Factura'` exige RUC de 11 dígitos.
- **Roles**: `admin`, `cajero`, `cliente`. Un cliente jamás puede acceder a endpoints del panel.
- **Permisos por rol**: validar en cada endpoint (`admin` todo; `cajero` solo pedidos, ventas, caja, stock). Ocultar un menú en la UI no es seguridad.
- **Códigos** (`code`, `number`): el servidor puede generarlos; la UI solo sugiere uno al crear.
- **Contraseñas**: guardar con hash (argon2/bcrypt). Idealmente emitir el token en una cookie `httpOnly` (ver `src/core/session.ts`).
- **Rate limit** en `/auth/login`.
