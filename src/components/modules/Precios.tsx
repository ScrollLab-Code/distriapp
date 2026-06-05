import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { CATS } from '../../types'
import { $p } from '../../lib/utils'
import { passOk } from '../../lib/auth'

export default function Precios() {
  const { prods, applyPrecios } = useStore()
  const [filter, setFilter] = useState('todo')
  const [pct, setPct] = useState('')

  const pvs: string[] = []
  prods.forEach(p => { if (p.pv && !pvs.includes(p.pv)) pvs.push(p.pv) })

  const preview = prods.filter(p => {
    if (filter === 'todo') return true
    if (filter.startsWith('c:')) return p.c === filter.slice(2)
    if (filter.startsWith('v:')) return p.pv === filter.slice(2)
    return true
  })

  const pctNum = parseFloat(pct) || 0

  function handleApply() {
    if (!pctNum) return
    const pass = prompt('Ingresa tu contraseña para confirmar:')
    if (pass === null) return
    if (!passOk(pass)) { alert('Contraseña incorrecta. No se aplicó ningún cambio.'); return }
    applyPrecios(pctNum, filter)
    setPct('')
    alert('Precios actualizados: ' + (pctNum > 0 ? '+' : '') + pctNum + '%')
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Ajuste de precios</span>
      </div>
      <div className="hint">Filtra por categoría o por proveedor específico. Se pedirá contraseña para confirmar.</div>

      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 max-w-2xl mb-4">
        <div className="form-grid">
          <div className="form-col">
            <label className="label">Filtrar por</label>
            <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="todo">Todas las categorías y proveedores</option>
              {CATS.map(x => <option key={x} value={'c:' + x}>Categoría: {x}</option>)}
              {pvs.map(x => <option key={x} value={'v:' + x}>Proveedor: {x}</option>)}
            </select>
          </div>
          <div className="form-col">
            <label className="label">Variación precio venta (%)</label>
            <input
              className="input"
              type="number"
              step={0.5}
              placeholder="15 para subir, -10 para bajar"
              value={pct}
              onChange={e => setPct(e.target.value)}
            />
          </div>
        </div>

        {pctNum === 0 && (
          <div className="text-stone-400 text-sm">Ingresa un porcentaje para ver la vista previa.</div>
        )}

        {pctNum !== 0 && preview.length === 0 && (
          <div className="text-stone-400 text-sm">No hay productos en esta selección.</div>
        )}

        {pctNum !== 0 && preview.length > 0 && (
          <>
            <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Vista previa — {pctNum > 0 ? '+' : ''}{pctNum}% sobre {preview.length} producto{preview.length !== 1 ? 's' : ''}
            </div>
            <div className="table-wrap mb-4">
              <table className="w-full border-collapse min-w-[480px]">
                <thead className="bg-stone-50 dark:bg-stone-900">
                  <tr>
                    {['Producto', 'Proveedor', 'Costo actual', 'Precio actual', 'Precio nuevo', 'Diferencia'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map(p => {
                    const np = Math.round(p.pr * (1 + pctNum / 100) * 100) / 100
                    const diff = np - p.pr
                    return (
                      <tr key={p.id} className="border-b border-stone-100 dark:border-stone-700 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="px-3 py-2 font-medium text-sm">{p.n}</td>
                        <td className="px-3 py-2 text-xs text-stone-400">{p.pv || '-'}</td>
                        <td className="px-3 py-2 font-mono text-sm text-stone-400">{$p(p.costo || 0)}</td>
                        <td className="px-3 py-2 font-mono text-sm text-stone-400">{$p(p.pr)}</td>
                        <td className="px-3 py-2"><span className="money">{$p(np)}</span></td>
                        <td className={`px-3 py-2 font-mono text-xs ${pctNum > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {pctNum > 0 ? '+' : ''}{$p(diff)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <button className="btn btn-primary" onClick={handleApply}>Aplicar cambio de precios</button>
          </>
        )}
      </div>
    </div>
  )
}
