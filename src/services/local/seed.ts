import type { Client, Order, Product, Sale } from '@/core/types'

export type LocalDB = { products: Product[]; clients: Client[]; orders: Order[]; sales: Sale[]; seq: number }

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=80`
const P = (code: string, description: string, model: string, family: string, brand: string, stock: number, price: number, oldPrice: number, rating: number, image: string): Product =>
  ({ code, description, model, family, brand, stock, unit: 'UND', cost: Math.round(price * 0.7 * 100) / 100, price, oldPrice, rating, image: img(image), published: true })
const C = (code: string, name: string, doc: string, address: string, city: string): Client => ({ code, name, doc, address, city, phone: '', email: '', active: true })

export function seed(): LocalDB {
  const products = [
    P('000359', 'Tinta Epson 101 Black', 'IMP780', 'Suministros', 'EPSON', 30, 39.9, 49.9, 4.8, 'photo-1612815154858-60aa4c59eaa6'),
    P('000830', 'Kit de tinta Epson 101', 'MU420', 'Suministros', 'EPSON', 20, 68, 79.9, 4.9, 'photo-1562408590-e32931084e23'),
    P('000361', 'Impresora térmica POS 80 mm', 'IMP780', 'Impresoras', 'MIYAKE', 12, 249, 289, 4.7, 'photo-1612815154858-60aa4c59eaa6'),
    P('000362', 'Lector de código de barras USB', 'SC103', 'Lectores', 'MIYAKE', 17, 145, 169, 4.6, 'photo-1556742049-0cfed4f6a45d'),
    P('000397', 'Balanza digital comercial 30 kg', 'MU420', 'Balanzas', 'CAS', 6, 548.8, 599, 4.9, 'photo-1587825140708-dfaf72ae4b04'),
    P('000398', 'Gaveta de dinero metálica', 'CD105', 'Punto de venta', 'MIYAKE', 8, 189, 219, 4.5, 'photo-1556742044-3c52d6e88c62'),
    P('000363', 'Pack papel térmico 80 x 80', 'PT107', 'Suministros', 'GENÉRICO', 120, 56, 64, 4.8, 'photo-1586864387967-d02ef85d93e8'),
    P('000384', 'Terminal POS táctil compacto', 'POS108', 'Punto de venta', 'MIYAKE', 10, 1299, 1499, 4.9, 'photo-1556740758-90de374c12ad'),
  ]
  const clients = [
    C('00005635', 'HIT HARDWARE & SOFTWARE E.I.R.L.', '20628015481', 'AV. PRADO NRO. 224 URB. PUEBLO LIBRE', 'ABANCAY'),
    C('00005402', '1B Y 5 S.A.C.', '20604225303', 'CAL. TRINIDAD CELIS NRO. 1575', 'LIMA'),
    C('00001895', 'ARH SANDWICHONE E.I.R.L.', '20536202138', 'JR. SAN MARTIN 17A D. LOTE 15', 'CHICLAYO'),
    C('00005542', '2F2 S.A.C.', '20608967215', 'AV. ALAMIRANTE 2262', 'SAN MIGUEL'),
    C('00004482', '4ARK S.A.C.', '20603882096', 'JR. PARACAS NRO. 555', 'PUEBLO LIBRE'),
  ]
  return { products, clients, orders: [], sales: [], seq: 1 }
}
