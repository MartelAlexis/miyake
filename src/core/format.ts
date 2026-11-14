export const today = () => new Date().toISOString().slice(0, 10)
export const money = (n: number) => 'S/ ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f1f3ef'/><text x='50%' y='50%' fill='%23a1aaa3' font-family='sans-serif' font-size='16' text-anchor='middle'>Sin imagen</text></svg>"
