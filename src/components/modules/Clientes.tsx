import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Cliente } from '../../types'
import { $p, totalR, uid } from '../../lib/utils'

function ClienteForm({ cliente, onClose }: { cliente: Cliente | null; onClose: () => void }) {
  const { addCliente, updateCliente } = useStore()
  const isNew = !cliente?.id
  const [form, setForm] = useState({
    nom: cliente?.nom ?? '',
    tel: cliente?.tel ?? '',
    dir: cliente?.dir ?? '',
    cuit: cliente?.cuit ?? '',
    notas: cliente?.notas ?? '',
  })

  function handleSave() {
    if (!form.nom.trim()) { alert('Ingresa el nombre del cliente'); return }
    const c: Cliente = { id: cliente?.id || uid(), ...form }
    if (isNew) addCliente(c)
    else updateCliente(c)
    onClose()
  }

  return (
    <div className="max-w-2xl">
      <div className="section-header">
        <span className="section-title">{isNew ? 'Nuevo cliente' : 'Editar cliente'}</span>
        <button className="btn btn-sm" onClick={onClose}>Volver</button>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6">
        <div className="form-grid">
          <div className="form-col-full">
            <label className="label">Nombre / Razón social</label>
            <input className="input" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Almacén Don Juan" />
          </div>
          <div className="form-col">
            <label className="label">Teléfono</label>
            <input className="input" value={form.tel} onChange={e => setForm(p => ({ ...p, tel: e.target.value }))} placeholder="299-000-0000" />
          </div>
          <div className="form-col">
            <label className="label">CUIT</label>
            <input className="input" value={form.cuit} onChange={e => setForm(p => ({ ...p, cuit: e.target.value }))} placeholder="30-00000000-0" />
          </div>
          <div className="form-col-full">
            <label className="label">Dirección</label>
            <input className="input" value={form.dir} onChange={e => setForm(p => ({ ...p, dir: e.target.value }))} placeholder="Calle 123" />
          </div>
          <div className="form-col-full">
            <label className="label">Notas</label>
            <textarea className="input" rows={2} value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} placeholder="Observaciones..." />
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

export default function Clientes() {
  const { clients, remitos, deleteCliente } = useStore()
  const [editing, setEditing] = useState<Cliente | null | undefined>(undefined)

  if (editing !== undefined) {
    return <ClienteForm cliente={editing} onClose={() => setEditing(undefined)} />
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Cartera de clientes</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing(null)}>+ Nuevo</button>
      </div>

      {clients.length === 0 && (
        <div className="text-center py-10 text-stone-400 text-sm">No hay clientes todavía.</div>
      )}

      {clients.map(c => {
        const debt = remitos.filter(r => r.cid === c.id && !r.paid).reduce((a, r) => a + totalR(r), 0)
        const tot = remitos.filter(r => r.cid === c.id).length
        const sub = [c.tel, c.dir, c.cuit].filter(Boolean).join(' - ')
        return (
          <div key={c.id} className="card">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{c.nom}</div>
                {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
              </div>
              <div className="text-right whitespace-nowrap">
                {debt > 0
                  ? <div className="money-err text-sm">Debe: {$p(debt)}</div>
                  : <div className="money-ok text-sm">Al día OK</div>
                }
                <div className="text-xs text-stone-400 mt-0.5">{tot} remito{tot !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex gap-1">
                <button className="btn btn-sm" onClick={() => setEditing(c)}>Editar</button>
                <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('¿Eliminar este cliente?')) deleteCliente(c.id) }}>X</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
