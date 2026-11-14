/* DATOS DE EJEMPLO AÚN NO CONECTADOS A SERVICIOS.
   Caja, periodos y tipos de movimiento de almacén son maquetas estáticas. Cuando exista el backend,
   crea su contrato en src/services/contracts.ts (CashService, PeriodsService...) y reemplaza estos arreglos. */

export const periods = [
  ['Sábado', '26-09-2026', 'Abierto', 'ARACELI', '13,231.50', 'PUEBLO LIBRE'],
  ['Viernes', '25-09-2026', 'Cerrado', 'ARACELI', '13,316.50', 'PUEBLO LIBRE'],
  ['Jueves', '24-09-2026', 'Cerrado', 'ALOPEZ', '13,219.50', 'PUEBLO LIBRE'],
  ['Miércoles', '23-09-2026', 'Cerrado', 'ARACELI', '13,550.50', 'PUEBLO LIBRE'],
  ['Martes', '22-09-2026', 'Cerrado', 'ARACELI', '14,291.50', 'PUEBLO LIBRE'],
  ['Lunes', '21-09-2026', 'Cerrado', 'CCHUGNAS', '13,054.50', 'PUEBLO LIBRE'],
  ['Sábado', '19-09-2026', 'Cerrado', 'CCHUGNAS', '13,054.50', 'PUEBLO LIBRE'],
]

export const inbound = ['Órdenes de compra', 'Producción', 'Importaciones', 'Transferencia entre almacén de la empresa', 'Anulación o devolución de venta - Nota de crédito', 'Cambio de mercadería en la venta', 'Recuperación propia (recogido)', 'Retiro por demostración al cliente', 'Bonificación en la compra', 'Devolución de mercadería al proveedor', 'Compras locales (sin orden de compra)', 'Ajuste de inventario']
export const outbound = ['Ventas de mercadería', 'Producción consumo de insumos', 'Transferencia entre almacén de la empresa', 'Cambio de mercadería a la venta', 'Donación al cliente', 'Demostración al cliente', 'Consignación del proveedor', 'Devolución de mercadería al proveedor', 'Ajuste de inventario', 'Merma de producción']
