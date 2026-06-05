import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { MovimientoCaja } from '../../types'
import { $p, uid, today, i2d, d2i } from '../../lib/utils'

type CajaFiltro = 'todo' | 'ingreso' | 'egreso' | 'contraboleta' | 'efectivo' | 'mercadopago'
type CajaCat = 'todo' | 'general' | 'proveedor' | 'cliente' | 'personal'

function catLabel(c: string): string {
  const m: Record<string, string> = { proveedor: 'Proveedor', cliente: 'Cliente', personal: 'Gasto personal', contraboleta: 'Contra-boleta', general: 'General' }
  return m[c] || 'General'
}

function catPillCls(c: string): string {
  const m: Record<string, string> = { proveedor: 'pill-blue', cliente: 'pill-paid', personal: 'pill-err', contraboleta: 'pill-warn', general: 'pill-ok' }
  return m[c] || 'pill-ok'
}

interface Stats { ef_in: number; mp_in: number; ef_out: number; mp_out: number; ef_net: number; mp_net: number; total_in: number; total_out: number; net: number; pers: number; contra: number }

function cajaStats(entries: MovimientoCaja[]): Stats {
  let ef_in = 0, mp_in = 0, ef_out = 0, mp_out = 0, pers = 0, contra = 0
  entries.forEach(e => {
    const m = +e.monto || 0
    if (e.tipo === 'ingreso') { if (e.metodo === 'mercadopago') mp_in += m; else ef_in += m }
    else if (e.tipo === 'egreso') { if (e.metodo === 'mercadopago') mp_out += m; else ef_out += m }
    if (e.cat === 'personal') pers += m
    if (e.tipo === 'contraboleta') contra += m
  })
  return { ef_in, mp_in, ef_out, mp_out, ef_net: ef_in - ef_out, mp_net: mp_in - mp_out, total_in: ef_in + mp_in, total_out: ef_out + mp_out, net: (ef_in + mp_in) - (ef_out + mp_out), pers, contra }
}

function MovimientoForm({ onClose }: { onClose: () => void }) {
  const { addCaja } = useStore()
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('ingreso')
  const [cat, setCat] = useState('general')
  const [metodo, setMetodo] = useState('efectivo')
  const [contraparte, setContraparte] = useState('')
  const [desc, setDesc] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(d2i(today()))

  function handleSave() {
    if (!desc.trim()) { alert('Ingresa una descripción'); return }
    if (!parseFloat(monto)) { alert('Ingresa un monto'); return }
    const e: MovimientoCaja = { id: uid(), tipo, metodo: metodo as 'efectivo' | 'mercadopago', cat: cat as MovimientoCaja['cat'], contraparte, desc, monto: parseFloat(monto), fecha: fecha ? i2d(fecha) : today() }
    addCaja(e)
    onClose()
  }

  return (
    <div className="max-w-lg">
      <div className="section-header">
        <span className="section-title">Nuevo movimiento</span>
        <button className="btn btn-sm" onClick={onClose}>Volver</button>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6">
        <div className="form-grid">
          <div className="form-col">
            <label className="label">Tipo</label>
            <select className="input" value={tipo} onChange={e => setTipo(e.target.value as 'ingreso' | 'egreso')}>
              <option value="ingreso">Ingreso (Haber)</option>
              <option value="egreso">Egreso (Debe)</option>
            </select>
          </div>
          <div className="form-col">
            <label className="label">Categoría</label>
            <select className="input" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="general">General</option>
              <option value="proveedor">Proveedor</option>
              <option value="cliente">Cliente</option>
              <option value="personal">Gasto personal</option>
            </select>
          </div>
          <div className="form-col">
            <label className="label">Método de pago</label>
            <select className="input" value={metodo} onChange={e => setMetodo(e.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="mercadopago">Mercado Pago / Débito</option>
            </select>
          </div>
          <div className="form-col">
            <label className="label">Contraparte (opcional)</label>
            <input className="input" value={contraparte} onChange={e => setContraparte(e.target.value)} placeholder="Nombre proveedor o cliente" />
          </div>
          <div className="form-col-full">
            <label className="label">Descripción</label>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Venta remito, Compra mercadería, Sueldo..." />
          </div>
          <div className="form-col">
            <label className="label">Monto ($)</label>
            <input className="input" type="number" min={0} step={0.01} value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-col">
            <label className="label">Fecha</label>
            <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
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

function ContraBoleta({ onClose }: { onClose: () => void }) {
  const { addCaja } = useStore()
  const [cat, setCat] = useState('proveedor')
  const [contraparte, setContraparte] = useState('')
  const [nro, setNro] = useState('')
  const [monto, setMonto] = useState('')
  const [desc, setDesc] = useState('')
  const [fecha, setFecha] = useState(d2i(today()))

  function handleSave() {
    if (!parseFloat(monto)) { alert('Ingresa el monto'); return }
    if (!desc.trim()) { alert('Ingresa el motivo'); return }
    const fullDesc = desc + (nro ? ' (Boleta N: ' + nro + ')' : '')
    const e: MovimientoCaja = { id: uid(), tipo: 'contraboleta', metodo: '', cat: cat as MovimientoCaja['cat'], contraparte, nro, desc: fullDesc, monto: parseFloat(monto), fecha: fecha ? i2d(fecha) : today() }
    addCaja(e)
    onClose()
  }

  return (
    <div className="max-w-lg">
      <div className="section-header">
        <span className="section-title">Nueva contra-boleta</span>
        <button className="btn btn-sm" onClick={onClose}>Volver</button>
      </div>
      <div className="hint">Registra devoluciones, notas de crédito o ajustes con un proveedor o cliente.</div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6">
        <div className="form-grid">
          <div className="form-col">
            <label className="label">Entre vos y</label>
            <select className="input" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="proveedor">Proveedor</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="form-col">
            <label className="label">Nombre proveedor / cliente</label>
            <input className="input" value={contraparte} onChange={e => setContraparte(e.target.value)} placeholder="Nombre de la contraparte" />
          </div>
          <div className="form-col">
            <label className="label">N° de boleta / remito original</label>
            <input className="input" value={nro} onChange={e => setNro(e.target.value)} placeholder="Ej: 0045 o R-0012" />
          </div>
          <div className="form-col">
            <label className="label">Monto ($)</label>
            <input className="input" type="number" min={0} step={0.01} value={monto} onChange={e => setMonto(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-col-full">
            <label className="label">Motivo / descripción</label>
            <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Devolución mercadería dañada, Nota de crédito..." />
          </div>
          <div className="form-col">
            <label className="label">Fecha</label>
            <input className="input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar contra-boleta</button>
        </div>
      </div>
    </div>
  )
}

export default function Caja() {
  const { caja, deleteCaja, cfg } = useStore()
  const [view, setView] = useState<'list' | 'new' | 'contrab'>('list')
  const [filtro, setFiltro] = useState<CajaFiltro>('todo')
  const [catFiltro, setCatFiltro] = useState<CajaCat>('todo')

  if (view === 'new') return <MovimientoForm onClose={() => setView('list')} />
  if (view === 'contrab') return <ContraBoleta onClose={() => setView('list')} />

  const vis = caja.filter(e => {
    const okF = filtro === 'todo' || (filtro === 'ingreso' && e.tipo === 'ingreso') || (filtro === 'egreso' && e.tipo === 'egreso') || (filtro === 'contraboleta' && e.tipo === 'contraboleta') || (filtro === 'efectivo' && e.metodo === 'efectivo') || (filtro === 'mercadopago' && e.metodo === 'mercadopago')
    const okC = catFiltro === 'todo' || (e.cat || 'general') === catFiltro
    return okF && okC
  })

  const st = cajaStats(caja)

  function imprimirCaja() {
    const c = cfg
    const rows = caja.slice().reverse().map(e => {
      const ing = e.tipo === 'ingreso', cb = e.tipo === 'contraboleta'
      const clr = ing ? '#16A34A' : cb ? '#B45309' : '#B91C1C'
      const signo = ing ? '+' : cb ? '+-' : '-'
      return `<tr><td>${e.fecha}</td><td>${e.desc || ''}${e.contraparte ? ' (' + e.contraparte + ')' : ''}</td><td>${catLabel(e.cat || 'general')}</td><td>${cb ? 'Contra-boleta' : ing ? 'Ingreso' : 'Egreso'}</td><td>${!cb ? (e.metodo === 'mercadopago' ? 'Mercado Pago' : 'Efectivo') : '-'}</td><td style="text-align:right;font-weight:bold;color:${clr}">${signo}${$p(e.monto)}</td></tr>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cierre de caja</title><style>@page{margin:12mm}body{font-family:Arial,sans-serif;font-size:12px;color:#000}.hd{text-align:center;margin-bottom:16px}.en{font-size:18px;font-weight:bold}table{width:100%;border-collapse:collapse;margin-bottom:16px}th{font-size:10px;text-transform:uppercase;color:#888;padding:6px 5px;border-bottom:1px solid #ccc;text-align:left;font-weight:600}td{padding:6px 5px;border-bottom:1px solid #eee;font-size:11px}.tot{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.tc{border:1px solid #ccc;border-radius:6px;padding:10px}.tc-l{font-size:9px;text-transform:uppercase;color:#888;margin-bottom:3px}.tc-v{font-size:15px;font-weight:bold}</style></head><body>
<div class="hd"><div class="en">${c.empresa}</div>${c.direccion ? `<div style="font-size:11px;color:#555">${c.direccion}</div>` : ''}<div style="font-size:11px;color:#555">CIERRE DE CAJA - ${today()}</div></div>
<div class="tot"><div class="tc"><div class="tc-l">Ingresos totales</div><div class="tc-v" style="color:#16A34A">${$p(st.total_in)}</div><div style="font-size:10px;color:#555">Ef: ${$p(st.ef_in)} / MP: ${$p(st.mp_in)}</div></div><div class="tc"><div class="tc-l">Egresos totales</div><div class="tc-v" style="color:#B91C1C">${$p(st.total_out)}</div><div style="font-size:10px;color:#555">Ef: ${$p(st.ef_out)} / MP: ${$p(st.mp_out)}</div></div><div class="tc"><div class="tc-l">Balance neto</div><div class="tc-v" style="color:${st.net >= 0 ? '#16A34A' : '#B91C1C'}">${$p(st.net)}</div><div style="font-size:10px;color:#555">Ef: ${$p(st.ef_net)} / MP: ${$p(st.mp_net)}</div></div><div class="tc"><div class="tc-l">Gastos personales</div><div class="tc-v" style="color:#B91C1C">${$p(st.pers)}</div><div style="font-size:10px;color:#555">Contra-boletas: ${$p(st.contra)}</div></div></div>
<table><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Tipo</th><th>Método</th><th style="text-align:right">Monto</th></tr></thead><tbody>${rows}</tbody></table>
<div style="margin-top:24px;border-top:1px solid #ccc;padding-top:8px;font-size:9px;color:#aaa;text-align:center">DistribApp - Documento interno</div></body></html>`
    const area = document.getElementById('printArea')!
    area.innerHTML = html
    area.style.display = 'block'
    setTimeout(() => { window.print(); setTimeout(() => { area.style.display = 'none'; area.innerHTML = '' }, 500) }, 200)
  }

  const filterPills: [CajaFiltro, string, string][] = [
    ['todo', 'Todos', 'filter-pill-on'],
    ['ingreso', 'Ingresos', 'filter-pill-ok-on'],
    ['egreso', 'Egresos', 'filter-pill-err-on'],
    ['contraboleta', 'Contra-boletas', 'filter-pill-warn-on'],
    ['efectivo', 'Efectivo', 'filter-pill-on'],
    ['mercadopago', 'MP', 'filter-pill-on'],
  ]
  const catPills: [CajaCat, string][] = [
    ['todo', 'Todas'], ['proveedor', 'Proveedor'], ['cliente', 'Cliente'], ['personal', 'Personal'], ['general', 'General'],
  ]

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Ingresos</div>
          <div className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{$p(st.total_in)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Ef: {$p(st.ef_in)} / MP: {$p(st.mp_in)}</div>
        </div>
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Egresos</div>
          <div className="font-mono text-xl font-bold text-red-600 dark:text-red-400">{$p(st.total_out)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Ef: {$p(st.ef_out)} / MP: {$p(st.mp_out)}</div>
        </div>
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Balance neto</div>
          <div className={`font-mono text-xl font-bold ${st.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{$p(st.net)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Ef: {$p(st.ef_net)} / MP: {$p(st.mp_net)}</div>
        </div>
        <div className="stat-card">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1">Gastos personales</div>
          <div className="font-mono text-xl font-bold text-red-600 dark:text-red-400">{$p(st.pers)}</div>
          <div className="text-xs text-stone-400 mt-0.5">Contra-boletas: {$p(st.contra)}</div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Libro de caja</span>
        <div className="flex gap-1.5 flex-wrap">
          <button className="btn btn-sm" onClick={imprimirCaja}>Imprimir cierre</button>
          <button className="btn btn-blue btn-sm" onClick={() => setView('contrab')}>+ Contra-boleta</button>
          <button className="btn btn-primary btn-sm" onClick={() => setView('new')}>+ Movimiento</button>
        </div>
      </div>

      <div className="filter-bar">
        {filterPills.map(([val, label, onCls]) => (
          <button key={val} className={`filter-pill ${filtro === val ? onCls : ''}`} onClick={() => setFiltro(val)}>{label}</button>
        ))}
      </div>
      <div className="filter-bar items-center">
        <span className="text-[11px] text-stone-400 font-medium mr-1">Categoría:</span>
        {catPills.map(([val, label]) => (
          <button key={val} className={`filter-pill ${catFiltro === val ? 'filter-pill-on' : ''}`} onClick={() => setCatFiltro(val)}>{label}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="w-full border-collapse min-w-[560px]">
          <thead className="bg-stone-50 dark:bg-stone-900">
            <tr>
              {['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Método', 'Monto', ''].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vis.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-stone-400 text-sm">Sin movimientos todavía</td></tr>
            )}
            {vis.slice().reverse().map(e => {
              const ing = e.tipo === 'ingreso', cb = e.tipo === 'contraboleta'
              const moneyCls = ing ? 'money-ok' : cb ? 'money' : 'money-err'
              const signo = ing ? '+' : cb ? '+-' : '-'
              return (
                <tr key={e.id} className="border-b border-stone-100 dark:border-stone-700 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="px-3 py-2.5 text-xs text-stone-400">{e.fecha}</td>
                  <td className="px-3 py-2.5 font-medium text-sm">
                    {e.desc || ''}
                    {e.contraparte && <small className="text-stone-400 ml-1">({e.contraparte})</small>}
                  </td>
                  <td className="px-3 py-2.5"><span className={`pill ${catPillCls(e.cat || 'general')}`}>{catLabel(e.cat || 'general')}</span></td>
                  <td className="px-3 py-2.5">
                    {cb ? <span className="pill pill-warn">Contra-boleta</span> : ing ? <span className="pill pill-paid">Ingreso</span> : <span className="pill pill-err">Egreso</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    {!cb ? <span className={`pill ${e.metodo === 'mercadopago' ? 'pill-blue' : 'pill-paid'}`}>{e.metodo === 'mercadopago' ? 'MP' : 'Efect'}</span> : '-'}
                  </td>
                  <td className="px-3 py-2.5"><span className={moneyCls}>{signo}{$p(e.monto)}</span></td>
                  <td className="px-3 py-2.5">
                    <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('¿Eliminar este movimiento?')) deleteCaja(e.id) }}>X</button>
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
