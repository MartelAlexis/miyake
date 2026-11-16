/* Modelos de dominio. Son el "contrato" entre la UI y el backend:
   el backend debe responder/recibir JSON con exactamente estas formas. */

export type Product = { code: string; description: string; model: string; family: string; brand: string; stock: number; unit: string; cost: number; price: number; oldPrice: number; rating: number; image: string; published: boolean }
export type Client = { code: string; name: string; doc: string; address: string; city: string; phone: string; email: string; active: boolean }
export type OrderItem = { code: string; description: string; qty: number; price: number }
export type OrderStatus = 'Pendiente' | 'Confirmado' | 'Enviado' | 'Entregado' | 'Cancelado'
export type InvoiceType = 'Boleta' | 'Factura'
export type Order = { number: string; userId?: string; invoiceType?: InvoiceType; date: string; name: string; doc: string; phone: string; email: string; delivery: 'Recojo' | 'Despacho'; address: string; city: string; payment: string; items: OrderItem[]; subtotal: number; shipping: number; total: number; status: OrderStatus }
export type OrderInput = Omit<Order, 'number' | 'userId' | 'date' | 'status' | 'subtotal' | 'shipping' | 'total'> & { /** Ley 29733: el cliente aceptó el tratamiento de sus datos. */ consent?: boolean }
export type Sale = { id: string; date: string; docRef: string; code: string; description: string; qty: number; price: number; amount: number; channel: 'Tienda' | 'Mostrador'; status: 'Emitida' | 'Anulada' }

/* ---------- Autenticación ---------- */
export type Role = 'admin' | 'cajero' | 'cliente'
export type Profile = { company: string; doc: string; phone: string; address: string; city: string }
export type User = { id: string; name: string; email: string; role: Role } & Partial<Profile>
export type Session = { token: string; user: User; expiresAt: number /* epoch ms */ }
export type RegisterInput = { name: string; email: string; password: string } & Partial<Profile>
export type ProfileInput = { name: string } & Profile
export const isStaff = (u: { role: Role } | null | undefined) => !!u && u.role !== 'cliente'

/* ---------- Libro de reclamaciones ---------- */
export type Claim = { number: string; type: 'Reclamo' | 'Queja'; name: string; doc: string; email: string; phone: string; orderNumber: string; detail: string; requestText: string; createdAt: string; consentAt: string; status: 'Pendiente' | 'Atendido'; response: string }
export type ClaimInput = Pick<Claim, 'type' | 'name' | 'doc' | 'email' | 'phone' | 'orderNumber' | 'detail' | 'requestText'> & { consent: boolean }
