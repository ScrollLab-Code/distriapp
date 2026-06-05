import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Producto, CATS, UNITS } from '../../types'
import { $p, stk, stlbl, daysUntil, i2d, uid, today, csvExport } from '../../lib/utils'

function Modal({ prod, onClose }: { prod: Producto | null; onClose: () => void }) {
  const { addProd, updateProd } = useStore()
  const isNew = !prod?.id
  const [form, setForm] = useState<Omit<Producto, 'id'>>({
    n: prod?.n ?? '',
    c: prod?.c ?? 'Bebidas',
    u: prod?.u ?? 'Unidades',
    q: prod?.q ?? 0,
    m: prod?.m ?? 10,
    pr: prod?.pr ?? 0,
    costo: prod?.costo ?? 0,
    margen: prod?.margen ?? 0,
    pv: prod?.pv ?? '',
    venc: prod?.venc ?? '',
  })

  function calcPrecio(costo: number, margen: number) {
    if (costo > 0) return Math.round(costo * (1 + margen / 100) * 100) / 100
    return form.pr
  }

  function handleSave() {
    if (!form.n.trim()) { alert('Ingresa el nombre del producto'); return }
    const p: Producto = { id: prod?.id || uid(), ...form }
    if (isNew) addProd(p)
    else updateProd(p)
    onClose()
  }

  function set(field: keyof typeof form, value: string | number) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'costo' || field === 'margen') {
        const c = field === 'costo' ? Number(value) : prev.costo
        const m = field === 'margen' ? Number(value) : prev.margen
        next.pr = calcPrecio(c, m)
      }
      return next
    })
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="text-base font-medium mb-4">{isNew ? 'Nuevo producto' : 'Editar producto'}</div>
        <div className="form-grid">
          <div className="form-col-full">
            <label className="label">Nombre</label>
            <input className="input" value={form.n} onChange={e => set('n', e.target.value)} placeholder="Agua Mineral 500ml" />
          </div>
          <div className="form-col">
            <label className="label">Categoría</label>
            <select className="input" value={form.c} onChange={e => set('c', e.target.value)}>
              {CATS.map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="form-col">
            <label className="label">Unidad</label>
            <select className="input" value={form.u} onChange={e => set('u', e.target.value)}>
              {UNITS.map(x => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="form-col">
            <label className="label">Stock actual</label>
            <input className="input" type="number" min={0} value={form.q} onChange={e => set('q', parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-col">
            <label className="label">Stock mínimo</label>
            <input className="input" type="number" min={0} value={form.m} onChange={e => set('m', parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-col">
            <label className="label">Precio COSTO ($)</label>
            <input className="input" type="number" min={0} step={0.01} value={form.costo} onChange={e => set('costo', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-col">
            <label className="label">Margen (%)</label>
            <input className="input" type="number" min={0} step={1} value={form.margen} onChange={e => set('margen', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-col">
            <label className="label">Precio VENTA ($)</label>
            <input className="input" type="number" min={0} step={0.01} value={form.pr} onChange={e => set('pr', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-col">
            <label className="label">Proveedor</label>
            <input className="input" value={form.pv} onChange={e => set('pv', e.target.value)} placeholder="Nombre del proveedor" />
          </div>
          <div className="form-col">
            <label className="label">Fecha de vencimiento</label>
            <input className="input" type="date" value={form.venc} onChange={e => set('venc', e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function Stock() {
  const { prods, adjProd, deleteProd } = useStore()
  const [filter, setFilter] = useState<'t' | 'k' | 'w' | 'e'>('t')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Producto | null | undefined>(undefined)

  const cnt = { k: 0, w: 0, e: 0 }
  prods.forEach(p => { cnt[stk(p.q, p.m)]++ })

  const vis = prods.filter(p => {
    const s = stk(p.q, p.m)
    if (filter !== 't' && s !== filter) return false
    const sr = search.toLowerCase()
    return !sr || p.n.toLowerCase().includes(sr) || (p.c || '').toLowerCase().includes(sr) || (p.pv || '').toLowerCase().includes(sr)
  })

  const inv = prods.reduce((a, p) => a + (p.costo || 0) * (p.q || 0), 0)
  const vta = prods.reduce((a, p) => a + (p.pr || 0) * (p.q || 0), 0)

  const vencW = prods.filter(p => p.venc && daysUntil(p.venc) >= 0 && daysUntil(p.venc) <= 30)
  const vencE = prods.filter(p => p.venc && daysUntil(p.venc) < 0)

  function expStock() {
    const rows: (string | number)[][] = [['Producto', 'Cat.', 'Proveedor', 'Costo', 'Precio Venta', 'Margen %', 'Stock', 'Stock Min.', 'Estado', 'Vencimiento']]
    prods.forEach(p => rows.push([p.n, p.c, p.pv || '-', p.costo || 0, p.pr, p.margen || 0, p.q, p.m, stlbl(stk(p.q, p.m)), p.venc ? i2d(p.venc) : '-']))
    csvExport('stock_' + today().replace(/\//g, '-') + '.csv', rows)
  }

  const pillColor = { k: 'pill-ok', w: 'pill-warn', e: 'pill-err' } as const

  return (
    <div>
      {editing !== undefined && (
        <Modal prod={editing} onClose={() => setEditing(undefined)} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Inversión en stock</div>
          <div className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">{$p(inv)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Precio costo × cantidad</div>
        </div>
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Valor de venta</div>
          <div className="font-mono text-xl font-bold text-brand-700 dark:text-brand-500">{$p(vta)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Precio venta × cantidad</div>
        </div>
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">Ganancia potencial</div>
          <div className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{$p(vta - inv)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Si se vende todo el stock</div>
        </div>
      </div>

      {vencE.length > 0 && (
        <div className="alert-err">
          <span>{vencE.length} VENCIDO{vencE.length !== 1 ? 'S' : ''}: {vencE.map(p => p.n).join(', ')}</span>
        </div>
      )}
      {vencW.length > 0 && (
        <div className="alert-warn">
          <span>Vencen en menos de 30 días: {vencW.map(p => `${p.n} (${daysUntil(p.venc)}d)`).join(', ')}</span>
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Stock disponible</span>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={expStock}>CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>+ Agregar</button>
        </div>
      </div>

      <div className="filter-bar">
        {([['t', `Todos (${prods.length})`, 'filter-pill-on'], ['k', `OK (${cnt.k})`, 'filter-pill-ok-on'], ['w', `Bajo (${cnt.w})`, 'filter-pill-warn-on'], ['e', `Faltante (${cnt.e})`, 'filter-pill-err-on']] as const).map(([val, label, onCls]) => (
          <button
            key={val}
            className={`filter-pill ${filter === val ? onCls : ''}`}
            onClick={() => setFilter(val)}
          >{label}</button>
        ))}
        <input
          className="input"
          style={{ maxWidth: 200 }}
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table className="w-full border-collapse min-w-[640px]">
          <thead className="bg-stone-50 dark:bg-stone-900">
            <tr>
              {['Producto', 'Cat.', 'Proveedor', 'Costo', 'P.Venta', 'Margen', 'Stock', 'Min.', 'Estado', 'Vencimiento', 'Acciones'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vis.length === 0 && (
              <tr><td colSpan={11} className="text-center py-10 text-stone-400 text-sm">Sin resultados</td></tr>
            )}
            {vis.map(p => {
              const s = stk(p.q, p.m)
              const mr = p.costo > 0 ? Math.round(((p.pr - p.costo) / p.costo) * 100) : 0
              const vd = daysUntil(p.venc)
              const vcls = !p.venc ? 'text-stone-400' : vd < 0 ? 'text-red-600 dark:text-red-400 font-bold' : vd <= 30 ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-green-600 dark:text-green-400'
              return (
                <tr key={p.id} className="border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-sm">{p.n}</td>
                  <td className="px-3 py-2.5 text-xs text-stone-400">{p.c}</td>
                  <td className="px-3 py-2.5 text-xs text-stone-400">{p.pv || '-'}</td>
                  <td className="px-3 py-2.5 font-mono text-sm text-stone-500">{$p(p.costo || 0)}</td>
                  <td className="px-3 py-2.5"><span className="money">{$p(p.pr)}</span></td>
                  <td className="px-3 py-2.5 font-mono text-sm text-green-600 dark:text-green-400">{mr}%</td>
                  <td className="px-3 py-2.5 font-mono text-sm font-semibold" style={{ color: s === 'k' ? 'var(--tw-prose-body)' : undefined }}>
                    <span className={s === 'e' ? 'text-red-600 dark:text-red-400' : s === 'w' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}>{p.q}</span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-sm text-stone-400">{p.m}</td>
                  <td className="px-3 py-2.5"><span className={`pill ${pillColor[s]}`}>{stlbl(s)}</span></td>
                  <td className={`px-3 py-2.5 text-xs ${vcls}`}>{p.venc ? i2d(p.venc) : '-'}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button className="btn btn-sm" onClick={() => adjProd(p.id, -1)}>-</button>
                      <button className="btn btn-sm" onClick={() => adjProd(p.id, 1)}>+</button>
                      <button className="btn btn-sm" onClick={() => setEditing(p)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('¿Eliminar este producto?')) deleteProd(p.id) }}>X</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
