import { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { Remito, RemitoItem } from '../../types'
import { $p, p4, totalR, uid, today, i2d, d2i } from '../../lib/utils'

function TicketPreview({ remito, onBack }: { remito: Remito; onBack: () => void }) {
  const { cfg } = useStore()
  const r = remito
  const c = cfg

  function doPrint() {
    let items = ''
    let subtotal = 0
    ;(r.its || []).forEach((i, idx) => {
      const s = (+(i.q || 0)) * (+(i.pr || 0))
      subtotal += s
      const bg = idx % 2 === 0 ? '#fff' : '#fafaf8'
      items += `<tr style="background:${bg}"><td>${i.desc || ''}</td><td style="text-align:center">${+i.q || 0}</td><td>${i.u || ''}</td><td style="text-align:right">${$p(i.pr || 0)}</td><td style="text-align:right;font-weight:600">${$p(s)}</td></tr>`
    })
    const esc = (s: string) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Remito #${p4(r.nr)}</title>
<style>@page{size:A4 portrait;margin:12mm 14mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;background:#fff}table.main{width:100%;border-collapse:collapse;font-size:11px}table.main thead{display:table-header-group}table.main tfoot{display:table-footer-group}table.main tbody{display:table-row-group}.hd-wrap{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #222;padding-bottom:8px;margin-bottom:8px}.emp-nom{font-size:15px;font-weight:bold}.emp-sub{font-size:10px;color:#555;margin-top:1px}.rem-lbl{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#888;text-align:right}.rem-num{font-size:22px;font-weight:bold;color:#9A6010;font-family:monospace;text-align:right}.info-row{display:flex;gap:30px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #ddd}.info-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:#888;margin-bottom:2px}.info-val{font-size:11px;font-weight:600}.info-sub{font-size:10px;color:#555}th{padding:6px 8px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;color:#444;background:#efefed;border-top:1px solid #ccc;border-bottom:1px solid #ccc}td{padding:5px 8px;font-size:11px;border-bottom:1px solid #eee}.tfoot-cont{padding:8px 0}.total-line{display:flex;justify-content:flex-end;align-items:baseline;gap:12px;border-top:2px solid #222;padding-top:8px;margin-top:4px}.total-lbl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px}.total-val{font-size:18px;font-weight:bold;color:#9A6010;font-family:monospace}.pie{margin-top:16px;border-top:1px solid #ddd;padding-top:6px;font-size:9px;color:#aaa;text-align:center}</style></head><body>
<table class="main">
<thead><tr><td colspan="5" style="padding:0;border:none"><div class="hd-wrap"><div><div class="emp-nom">${esc(c.empresa)}</div>${c.direccion ? `<div class="emp-sub">${esc(c.direccion)}</div>` : ''}${c.telefono ? `<div class="emp-sub">Tel: ${esc(c.telefono)}</div>` : ''}${c.cuit ? `<div class="emp-sub">CUIT: ${esc(c.cuit)}</div>` : ''}</div><div><div class="rem-lbl">Remito N&deg;</div><div class="rem-num">${p4(r.nr)}</div></div></div><div class="info-row"><div><div class="info-lbl">Cliente</div><div class="info-val">${esc(r.cl)}</div>${r.di ? `<div class="info-sub">${esc(r.di)}</div>` : ''}</div><div><div class="info-lbl">Fecha</div><div class="info-val">${r.fe}</div></div></div><table style="width:100%;border-collapse:collapse"><thead><tr><th style="width:45%">Producto / Descripción</th><th style="width:8%;text-align:center">Cant.</th><th style="width:10%">Unidad</th><th style="width:17%;text-align:right">Precio unit.</th><th style="width:20%;text-align:right">Subtotal</th></tr></thead></table></td></tr></thead>
<tfoot><tr><td colspan="5" style="padding:0;border:none"><div class="tfoot-cont"><div class="total-line"><span class="total-lbl">Total del remito</span><span class="total-val">${$p(subtotal)}</span></div></div><div class="pie">Documento no válido como factura &nbsp;|&nbsp; ${esc(c.empresa)}${c.telefono ? ' &nbsp;|&nbsp; ' + esc(c.telefono) : ''} &nbsp;|&nbsp; Remito N&deg; ${p4(r.nr)}</div></td></tr></tfoot>
<tbody><tr style="border:none"><td colspan="5" style="padding:0;border:none"><table style="width:100%;border-collapse:collapse;font-size:11px"><tbody>${items}</tbody></table></td></tr></tbody>
</table></body></html>`

    const area = document.getElementById('printArea')!
    area.innerHTML = htmlContent
    area.style.display = 'block'
    setTimeout(() => {
      window.print()
      setTimeout(() => { area.style.display = 'none'; area.innerHTML = '' }, 500)
    }, 200)
  }

  const items = r.its || []
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Remito #{p4(r.nr)}</span>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={onBack}>Volver</button>
          <button className="btn btn-primary btn-sm" onClick={doPrint}>Imprimir ticket</button>
        </div>
      </div>
      <div className="hint">Se genera una página lista para imprimir en A4. Configura el papel en la impresora.</div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 max-w-md font-mono text-sm leading-7">
        <div className="text-center font-bold text-base">{c.empresa}</div>
        {c.direccion && <div className="text-center text-xs text-stone-400">{c.direccion}</div>}
        {c.telefono && <div className="text-center text-xs text-stone-400">{c.telefono}</div>}
        {c.cuit && <div className="text-center text-xs text-stone-400">CUIT: {c.cuit}</div>}
        <hr className="my-2 border-dashed border-stone-300" />
        <div>REMITO N: <strong>{p4(r.nr)}</strong></div>
        <div>Fecha: {r.fe}</div>
        <div>Cliente: {r.cl}</div>
        {r.di && <div className="text-xs text-stone-400">{r.di}</div>}
        <hr className="my-2 border-dashed border-stone-300" />
        {items.map(i => (
          <div key={i.id}>
            <div className="flex justify-between"><span>{i.desc}</span><span>{i.q}x{$p(i.pr)}</span></div>
            <div className="text-right font-bold border-b border-dotted border-stone-300 pb-0.5 mb-1">{$p((+i.q || 0) * (+i.pr || 0))}</div>
          </div>
        ))}
        <hr className="my-2 border-dashed border-stone-300" />
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL:</span><span className="money">{$p(totalR(r))}</span>
        </div>
        <hr className="my-2 border-dashed border-stone-300" />
        <div className="text-center font-bold">{r.paid ? '** COBRADO **' : '>> PENDIENTE <<'}</div>
        {r.nt && <div className="text-xs text-stone-400 mt-1.5">Nota: {r.nt}</div>}
        <div className="text-center text-[10px] text-stone-400 mt-2">No válido como factura</div>
      </div>
    </div>
  )
}

function NewRemito({ onClose, onSaved }: { onClose: () => void; onSaved: (r: Remito) => void }) {
  const { prods, clients, nn, addRemito } = useStore()
  const [cliVal, setCliVal] = useState('')
  const [cliId, setCliId] = useState('')
  const [di, setDi] = useState('')
  const [nt, setNt] = useState('')
  const [fe, setFe] = useState(d2i(today()))
  const [items, setItems] = useState<RemitoItem[]>([])
  const [prodSearch, setProdSearch] = useState('')
  const [prodDropOpen, setProdDropOpen] = useState(false)
  const [cliDropOpen, setCliDropOpen] = useState(false)
  const cliRef = useRef<HTMLInputElement>(null)
  const prodRef = useRef<HTMLInputElement>(null)

  const avail = prods.filter(p => p.q > 0)

  const cliResults = clients.filter(c =>
    c.nom.toLowerCase().includes(cliVal.toLowerCase()) || (c.tel || '').includes(cliVal)
  ).slice(0, 8)

  const prodResults = avail.filter(p =>
    !prodSearch || p.n.toLowerCase().includes(prodSearch.toLowerCase()) || (p.c || '').toLowerCase().includes(prodSearch.toLowerCase())
  ).slice(0, 10)

  function selectCli(cid: string) {
    const c = clients.find(x => x.id === cid)
    if (!c) return
    setCliId(c.id)
    setCliVal(c.nom)
    setDi(c.dir || '')
    setCliDropOpen(false)
  }

  function addItem(pid: string) {
    const p = prods.find(x => x.id === pid)
    if (!p) return
    const existing = items.find(i => i.pid === pid)
    if (existing) {
      setItems(items.map(i => i.pid === pid ? { ...i, q: (i.q || 0) + 1 } : i))
    } else {
      setItems([...items, { id: uid(), pid: p.id, desc: p.n, q: 1, u: p.u, pr: p.pr || 0 }])
    }
    setProdSearch('')
    setProdDropOpen(false)
    prodRef.current?.focus()
  }

  function removeItem(id: string) {
    setItems(items.filter(i => i.id !== id))
  }

  function updateItem(id: string, field: keyof RemitoItem, value: string | number) {
    setItems(items.map(i => {
      if (i.id !== id) return i
      if (field === 'pid') {
        const p = prods.find(x => x.id === value)
        return { ...i, pid: String(value), desc: p?.n || '', u: p?.u || '', pr: p?.pr || 0 }
      }
      return { ...i, [field]: value }
    }))
  }

  const tot = items.reduce((a, i) => a + (+i.q || 0) * (+i.pr || 0), 0)

  function handleSave() {
    const cl = cliVal.trim()
    if (!cl) { alert('Ingresa el nombre del cliente'); return }
    if (!items.length) { alert('Agrega al menos un producto'); return }
    const r: Remito = {
      id: uid(), nr: nn, cid: cliId, cl, di, nt,
      fe: i2d(fe) || today(), its: [...items], paid: false,
    }
    addRemito(r)
    onSaved(r)
  }

  useEffect(() => {
    cliRef.current?.focus()
  }, [])

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Nuevo remito</span>
        <button className="btn btn-sm" onClick={onClose}>Volver</button>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 max-w-2xl">
        <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Cliente</div>
        <div className="relative mb-3">
          <input
            ref={cliRef}
            className="input"
            type="text"
            placeholder="Buscar cliente por nombre..."
            value={cliVal}
            onChange={e => { setCliVal(e.target.value); setCliId(''); setCliDropOpen(true) }}
            onFocus={() => setCliDropOpen(true)}
            onBlur={() => setTimeout(() => setCliDropOpen(false), 200)}
          />
          {cliDropOpen && cliResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg max-h-48 overflow-y-auto z-50 shadow-lg">
              {cliResults.map(c => (
                <div
                  key={c.id}
                  className="px-3 py-2 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-sm border-b border-stone-100 dark:border-stone-700 last:border-0"
                  onMouseDown={() => selectCli(c.id)}
                >
                  {c.nom}
                  {c.tel && <small className="block text-xs text-stone-400">{c.tel}{c.dir ? ' - ' + c.dir : ''}</small>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-grid mt-2">
          <div className="form-col">
            <label className="label">Dirección de entrega</label>
            <input className="input" value={di} onChange={e => setDi(e.target.value)} placeholder="Calle 123" />
          </div>
          <div className="form-col">
            <label className="label">Fecha</label>
            <input className="input" type="date" value={fe} onChange={e => setFe(e.target.value)} />
          </div>
          <div className="form-col-full">
            <label className="label">Notas</label>
            <input className="input" value={nt} onChange={e => setNt(e.target.value)} placeholder="Observaciones" />
          </div>
        </div>

        <hr className="my-4 border-stone-200 dark:border-stone-700" />

        <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
          Productos
          {avail.length < prods.length && (
            <span className="text-amber-600 dark:text-amber-400 ml-2 normal-case font-normal">({prods.length - avail.length} sin stock ocultos)</span>
          )}
        </div>

        <div className="relative mb-3">
          <input
            ref={prodRef}
            className="input"
            type="text"
            placeholder="Buscar producto para agregar..."
            value={prodSearch}
            onChange={e => { setProdSearch(e.target.value); setProdDropOpen(true) }}
            onFocus={() => setProdDropOpen(true)}
            onBlur={() => setTimeout(() => setProdDropOpen(false), 200)}
          />
          {prodDropOpen && prodResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg max-h-48 overflow-y-auto z-50 shadow-lg">
              {prodResults.map(p => (
                <div
                  key={p.id}
                  className="px-3 py-2 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700 text-sm border-b border-stone-100 dark:border-stone-700 last:border-0"
                  onMouseDown={() => addItem(p.id)}
                >
                  {p.n}
                  <small className="block text-xs text-stone-400">{p.c} - Stock: {p.q} {p.u} - {$p(p.pr)}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length === 0 && (
          <div className="text-center py-4 text-stone-400 text-xs">Buscá y agregá productos con el campo de arriba</div>
        )}

        {items.length > 0 && (
          <>
            <div className="grid gap-2 mb-1" style={{ gridTemplateColumns: '1fr 52px 68px 84px 84px 28px' }}>
              {['Producto', 'Cant.', 'Unidad', 'Precio u.', 'Subtotal', ''].map(h => (
                <span key={h} className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {items.map(it => (
              <div key={it.id} className="grid gap-1.5 items-center mb-2" style={{ gridTemplateColumns: '1fr 52px 68px 84px 84px 28px' }}>
                <select className="input text-xs py-1" value={it.pid} onChange={e => updateItem(it.id, 'pid', e.target.value)}>
                  {avail.map(p => <option key={p.id} value={p.id}>{p.n}</option>)}
                </select>
                <input className="input text-xs py-1" type="number" min={1} value={it.q} onChange={e => updateItem(it.id, 'q', parseFloat(e.target.value) || 0)} />
                <input className="input text-xs py-1" value={it.u} onChange={e => updateItem(it.id, 'u', e.target.value)} />
                <input className="input text-xs py-1" type="number" min={0} step={0.01} value={it.pr} onChange={e => updateItem(it.id, 'pr', parseFloat(e.target.value) || 0)} />
                <div className="font-mono text-xs font-semibold text-brand-700 dark:text-brand-500 text-right">{$p((+it.q || 0) * (+it.pr || 0))}</div>
                <button className="btn btn-sm btn-danger px-1.5" onClick={() => removeItem(it.id)}>X</button>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-brand-700 dark:border-brand-600 rounded-lg px-5 py-3">
                <div className="text-[10px] font-semibold text-brand-700 dark:text-brand-500 uppercase tracking-wider mb-0.5">Total del remito</div>
                <div className="font-mono text-2xl font-bold text-brand-700 dark:text-brand-500">{$p(tot)}</div>
              </div>
            </div>
          </>
        )}

        <div className="form-actions mt-5">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave}>Guardar remito</button>
        </div>
      </div>
    </div>
  )
}

export default function Remitos() {
  const { remitos, togglePaid, deleteRemito } = useStore()
  const [view, setView] = useState<'list' | 'new' | 'print'>('list')
  const [printRemito, setPrintRemito] = useState<Remito | null>()

  if (view === 'print' && printRemito) {
    return <TicketPreview remito={printRemito} onBack={() => { setView('list'); setPrintRemito(null) }} />
  }

  if (view === 'new') {
    return (
      <NewRemito
        onClose={() => setView('list')}
        onSaved={r => { setPrintRemito(r); setView('print') }}
      />
    )
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Remitos emitidos</span>
        <button className="btn btn-primary btn-sm" onClick={() => setView('new')}>+ Nuevo remito</button>
      </div>

      {remitos.length === 0 && (
        <div className="text-center py-10 text-stone-400 text-sm">No hay remitos. Crea el primero.</div>
      )}

      {remitos.map(r => (
        <div key={r.id} className="card">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="font-mono text-xl font-bold text-brand-700 dark:text-brand-500 min-w-[62px]">#{p4(r.nr)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{r.cl}</div>
              <div className="text-xs text-stone-400 mt-0.5">
                {r.fe} - {(r.its || []).length} item{(r.its || []).length !== 1 ? 's' : ''}
                {r.di ? ' - ' + r.di : ''}
              </div>
            </div>
            <div className="text-right whitespace-nowrap">
              <div className="money">{$p(totalR(r))}</div>
              <div className="mt-0.5"><span className={`pill ${r.paid ? 'pill-paid' : 'pill-pend'}`}>{r.paid ? 'Cobrado' : 'Pendiente'}</span></div>
            </div>
            <div className="flex gap-1">
              <button className={`btn btn-sm ${r.paid ? 'btn-warning' : 'btn-success'}`} onClick={() => togglePaid(r.id)}>
                {r.paid ? 'Revertir' : 'Cobrado'}
              </button>
              <button className="btn btn-sm" onClick={() => { setPrintRemito(r); setView('print') }}>Ticket</button>
              <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('¿Eliminar este remito?')) deleteRemito(r.id) }}>X</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
