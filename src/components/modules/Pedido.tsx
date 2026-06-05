import { useStore } from '../../store/useStore'
import { $p, stk, today, csvExport } from '../../lib/utils'

export default function Pedido() {
  const { prods } = useStore()
  const need = prods.filter(p => stk(p.q, p.m) !== 'k')

  function expPedido() {
    const rows: (string | number)[][] = [
      ['PEDIDO AL PROVEEDOR', '', '', '', today()],
      [''],
      ['Producto', 'Cat.', 'Proveedor', 'Stock', 'Min.', 'A Pedir', 'Costo', 'P.Venta'],
    ]
    need.forEach(p => rows.push([p.n, p.c, p.pv || '-', p.q, p.m, p.m - p.q, p.costo || 0, p.pr]))
    csvExport('pedido_' + today().replace(/\//g, '-') + '.csv', rows)
  }

  if (!need.length) {
    return (
      <div>
        <div className="section-header"><span className="section-title">Pedido al proveedor</span></div>
        <div className="alert-ok">Stock completo. No hay productos para reponer.</div>
      </div>
    )
  }

  const sColor = { k: 'text-green-600 dark:text-green-400', w: 'text-amber-600 dark:text-amber-400', e: 'text-red-600 dark:text-red-400' } as const

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Pedido al proveedor</span>
        <button className="btn btn-sm" onClick={expPedido}>CSV</button>
      </div>
      <div className="alert-warn">{need.length} producto{need.length !== 1 ? 's' : ''} para reponer</div>
      <div className="table-wrap">
        <table className="w-full border-collapse min-w-[560px]">
          <thead className="bg-stone-50 dark:bg-stone-900">
            <tr>
              {['Producto', 'Cat.', 'Proveedor', 'Stock', 'Min.', 'A pedir', 'Costo', 'P.Venta'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {need.map(p => {
              const s = stk(p.q, p.m)
              return (
                <tr key={p.id} className="border-b border-stone-100 dark:border-stone-700 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="px-3 py-2.5 font-medium text-sm">{p.n}</td>
                  <td className="px-3 py-2.5 text-xs text-stone-400">{p.c}</td>
                  <td className="px-3 py-2.5 text-xs text-stone-400">{p.pv || '-'}</td>
                  <td className={`px-3 py-2.5 font-mono font-semibold text-sm ${sColor[s]}`}>{p.q}</td>
                  <td className="px-3 py-2.5 font-mono text-sm text-stone-400">{p.m}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-sm text-brand-700 dark:text-brand-500">{p.m - p.q}</td>
                  <td className="px-3 py-2.5 font-mono text-sm text-stone-400">{$p(p.costo || 0)}</td>
                  <td className="px-3 py-2.5"><span className="money">{$p(p.pr)}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
