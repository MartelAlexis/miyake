import type { Claim, ClaimInput, Client, Order, OrderInput, OrderStatus, Product, ProfileInput, RegisterInput, Sale, Session, User } from '@/core/types'
import type { Result } from '@/core/result'

/* CONTRATOS DE LOS SERVICIOS.
   La UI solo conoce estas interfaces. Hay dos implementaciones intercambiables:
     - services/local  -> localStorage (demo, sin servidor)
     - services/api    -> backend REST real
   Se elige con VITE_DATA_SOURCE. Para conectar tu backend implementa lo mismo que hace services/api. */

export interface AuthService {
  login(email: string, password: string): Promise<Result<Session>>
  /** Alta de cliente (tienda). El backend debe asignar siempre el rol 'cliente'. */
  register(input: RegisterInput): Promise<Result<Session>>
  /** Actualiza los datos de la cuenta del usuario con sesión iniciada. */
  updateProfile(input: ProfileInput): Promise<Result<User>>
  logout(): Promise<void>
}

export interface CatalogService {
  /** publishedOnly = true es lo que debe usar la tienda pública (endpoint sin autenticación). */
  list(opts?: { publishedOnly?: boolean }): Promise<Product[]>
  save(product: Product, isNew: boolean): Promise<Result>
  remove(code: string): Promise<Result>
}

export interface ClientsService {
  list(): Promise<Client[]>
  save(client: Client, isNew: boolean): Promise<Result>
  remove(code: string): Promise<Result>
}

export interface OrdersService {
  list(): Promise<Order[]>
  /** Pedidos del cliente con sesión iniciada (el backend los filtra por el token). */
  listMine(): Promise<Order[]>
  getByNumber(number: string): Promise<Order | null>
  place(input: OrderInput): Promise<Result<Order>>
  setStatus(number: string, status: OrderStatus): Promise<Result>
}

export interface SalesService {
  list(): Promise<Sale[]>
  counterSale(code: string, qty: number): Promise<Result>
  /** Dataset ventas_detalle con cliente_hash (sin datos personales). Solo existe con backend. */
  exportDataset?(): Promise<string>
}

export interface ClaimsService {
  /** Público: el libro de reclamaciones no exige sesión. */
  create(input: ClaimInput): Promise<Result<Claim>>
  list(): Promise<Claim[]>
  respond(number: string, response: string): Promise<Result>
}

export interface Services {
  auth: AuthService
  catalog: CatalogService
  clients: ClientsService
  orders: OrdersService
  sales: SalesService
  claims: ClaimsService
  /** Solo existe en modo local (restablece los datos de ejemplo). */
  resetDemo?: () => Promise<void>
}
