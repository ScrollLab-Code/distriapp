export interface Producto {
  id: string
  n: string
  c: string
  u: string
  q: number
  m: number
  pr: number
  costo: number
  margen: number
  pv: string
  venc: string
}

export interface RemitoItem {
  id: string
  pid: string
  desc: string
  q: number
  u: string
  pr: number
}

export interface Remito {
  id: string
  nr: number
  cid: string
  cl: string
  di: string
  nt: string
  fe: string
  its: RemitoItem[]
  paid: boolean
}

export interface Cliente {
  id: string
  nom: string
  tel: string
  dir: string
  cuit: string
  notas: string
}

export interface MovimientoCaja {
  id: string
  tipo: 'ingreso' | 'egreso' | 'contraboleta'
  metodo: 'efectivo' | 'mercadopago' | ''
  cat: 'general' | 'proveedor' | 'cliente' | 'personal' | 'contraboleta'
  contraparte: string
  nro?: string
  desc: string
  monto: number
  fecha: string
}

export interface ConfigEmpresa {
  empresa: string
  direccion: string
  telefono: string
  cuit: string
}

export type TabId = 'stock' | 'remitos' | 'clientes' | 'cobros' | 'caja' | 'precios' | 'pedido' | 'config'

export const CATS = ['Bebidas', 'Lacteos', 'Secos', 'Frescos', 'Limpieza', 'Snacks', 'Otros'] as const
export const UNITS = ['Unidades', 'Cajas', 'Bolsas', 'Kg', 'Litros', 'Docenas', 'Packs'] as const
