import { create } from 'zustand'
import { Producto, Remito, Cliente, MovimientoCaja, ConfigEmpresa, TabId } from '../types'
import { lsGet, lsSet, uid } from '../lib/utils'

const DEFAULT_PRODS: Producto[] = [
  { id: uid(), n: 'Agua Mineral 500ml', c: 'Bebidas', q: 120, m: 50, u: 'Unidades', pr: 350, costo: 200, margen: 75, pv: 'Proveedor A', venc: '' },
  { id: uid(), n: 'Gaseosa Cola 2L', c: 'Bebidas', q: 22, m: 48, u: 'Cajas', pr: 2800, costo: 1800, margen: 55, pv: 'Proveedor A', venc: '' },
  { id: uid(), n: 'Arroz 1kg', c: 'Secos', q: 0, m: 20, u: 'Bolsas', pr: 1200, costo: 900, margen: 33, pv: 'Proveedor B', venc: '' },
  { id: uid(), n: 'Leche Entera 1L', c: 'Lacteos', q: 15, m: 30, u: 'Unidades', pr: 980, costo: 700, margen: 40, pv: 'Proveedor C', venc: '' },
  { id: uid(), n: 'Fideos 500g', c: 'Secos', q: 45, m: 30, u: 'Bolsas', pr: 750, costo: 500, margen: 50, pv: 'Proveedor B', venc: '' },
]

const DEFAULT_CFG: ConfigEmpresa = { empresa: 'Mi Distribuidora', direccion: '', telefono: '', cuit: '' }

interface AppState {
  tab: TabId
  prods: Producto[]
  remitos: Remito[]
  clients: Cliente[]
  caja: MovimientoCaja[]
  cfg: ConfigEmpresa
  nn: number

  setTab: (tab: TabId) => void
  loadData: () => void
  save: () => void

  addProd: (p: Producto) => void
  updateProd: (p: Producto) => void
  deleteProd: (id: string) => void
  adjProd: (id: string, delta: number) => void

  addRemito: (r: Remito) => void
  deleteRemito: (id: string) => void
  togglePaid: (id: string) => void
  bumpNN: () => void

  addCliente: (c: Cliente) => void
  updateCliente: (c: Cliente) => void
  deleteCliente: (id: string) => void

  addCaja: (e: MovimientoCaja) => void
  deleteCaja: (id: string) => void

  saveCfg: (cfg: ConfigEmpresa) => void

  applyPrecios: (pct: number, filter: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  tab: 'stock',
  prods: [],
  remitos: [],
  clients: [],
  caja: [],
  cfg: DEFAULT_CFG,
  nn: 1,

  setTab: (tab) => set({ tab }),

  loadData: () => {
    set({
      prods: lsGet<Producto[]>('dp', DEFAULT_PRODS),
      remitos: lsGet<Remito[]>('dr', []),
      clients: lsGet<Cliente[]>('dc', []),
      caja: lsGet<MovimientoCaja[]>('dj', []),
      cfg: lsGet<ConfigEmpresa>('dcfg', DEFAULT_CFG),
      nn: lsGet<number>('dn', 1),
    })
  },

  save: () => {
    const s = get()
    lsSet('dp', s.prods)
    lsSet('dr', s.remitos)
    lsSet('dc', s.clients)
    lsSet('dj', s.caja)
    lsSet('dn', s.nn)
  },

  addProd: (p) => {
    set(s => ({ prods: [...s.prods, p] }))
    get().save()
  },
  updateProd: (p) => {
    set(s => ({ prods: s.prods.map(x => x.id === p.id ? p : x) }))
    get().save()
  },
  deleteProd: (id) => {
    set(s => ({ prods: s.prods.filter(x => x.id !== id) }))
    get().save()
  },
  adjProd: (id, delta) => {
    set(s => ({ prods: s.prods.map(p => p.id === id ? { ...p, q: Math.max(0, p.q + delta) } : p) }))
    get().save()
  },

  addRemito: (r) => {
    set(s => ({
      remitos: [r, ...s.remitos],
      nn: s.nn + 1,
      prods: s.prods.map(p => {
        const it = r.its.find(i => i.pid === p.id)
        return it ? { ...p, q: Math.max(0, p.q - Math.round(+it.q || 0)) } : p
      }),
    }))
    get().save()
  },
  deleteRemito: (id) => {
    set(s => ({ remitos: s.remitos.filter(r => r.id !== id) }))
    get().save()
  },
  togglePaid: (id) => {
    set(s => ({ remitos: s.remitos.map(r => r.id === id ? { ...r, paid: !r.paid } : r) }))
    get().save()
  },
  bumpNN: () => set(s => ({ nn: s.nn + 1 })),

  addCliente: (c) => {
    set(s => ({ clients: [...s.clients, c] }))
    get().save()
  },
  updateCliente: (c) => {
    set(s => ({ clients: s.clients.map(x => x.id === c.id ? c : x) }))
    get().save()
  },
  deleteCliente: (id) => {
    set(s => ({ clients: s.clients.filter(c => c.id !== id) }))
    get().save()
  },

  addCaja: (e) => {
    set(s => ({ caja: [...s.caja, e] }))
    get().save()
  },
  deleteCaja: (id) => {
    set(s => ({ caja: s.caja.filter(e => e.id !== id) }))
    get().save()
  },

  saveCfg: (cfg) => {
    set({ cfg })
    lsSet('dcfg', cfg)
  },

  applyPrecios: (pct, filter) => {
    set(s => ({
      prods: s.prods.map(p2 => {
        const match =
          filter === 'todo' ||
          (filter.startsWith('c:') && p2.c === filter.slice(2)) ||
          (filter.startsWith('v:') && p2.pv === filter.slice(2))
        if (!match) return p2
        const np = Math.round(p2.pr * (1 + pct / 100) * 100) / 100
        const nm = p2.costo > 0 ? Math.round(((np - p2.costo) / p2.costo) * 100) : p2.margen
        return { ...p2, pr: np, margen: nm }
      }),
    }))
    get().save()
  },
}))
