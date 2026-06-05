import { useStore } from '../../store/useStore'
import { $p, p4, totalR } from '../../lib/utils'

export default function Cobros() {
  const { remitos, clients, togglePaid } = useStore()

  const pend = remitos.filter(r => !r.paid)
  const tot = pend.reduce((a, r) => a + totalR(r), 0)

  const groups: Record<string, { name: string; its: typeof remitos }> = {}
  remitos.forEach(r => {
    const k = r.cid || ('_' + r.cl)
    if (!groups[k]) {
      const cl = clients.find(c => c.id === r.cid)
      groups[k] = { name: cl ? cl.nom : (r.cl || 'Sin nombre'), its: [] }
    }
    groups[k].its.push(r)
  })

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Estado de cobros</span>
      </div>

      {pend.length === 0
        ? <div className="alert-ok">Todos los remitos están cobrados.</div>
        : <div className="alert-warn">Deuda total: <strong>{$p(tot)}</strong> en {pend.length} remito{pend.length !== 1 ? 's' : ''}</div>
      }

      {Object.keys(groups).length === 0 && (
        <div className="text-center py-10 text-stone-400 text-sm">No hay remitos.</div>
      )}

      {Object.values(groups).map(g => {
        const gd = g.its.filter(r => !r.paid).reduce((a, r) => a + totalR(r), 0)
        return (
          <div key={g.name} className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-4 mb-2.5">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <div className="font-medium text-base">{g.name}</div>
              <div className={gd > 0 ? 'money-err' : 'money-ok'}>{gd > 0 ? 'Debe ' + $p(gd) : 'Al día OK'}</div>
            </div>
            <div className="table-wrap">
              <table className="w-full border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-900">
                  <tr>
                    {['Remito', 'Fecha', 'Total', 'Estado', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.its.map(r => (
                    <tr key={r.id} className="border-b border-stone-100 dark:border-stone-700 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="px-3 py-2.5 font-mono font-semibold text-brand-700 dark:text-brand-500">#{p4(r.nr)}</td>
                      <td className="px-3 py-2.5 text-xs text-stone-400">{r.fe}</td>
                      <td className="px-3 py-2.5"><span className="money">{$p(totalR(r))}</span></td>
                      <td className="px-3 py-2.5">
                        <span className={`pill ${r.paid ? 'pill-paid' : 'pill-pend'}`}>{r.paid ? 'Cobrado' : 'Pendiente'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <button
                          className={`btn btn-sm ${r.paid ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => togglePaid(r.id)}
                        >{r.paid ? 'Revertir' : 'Cobrado'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
