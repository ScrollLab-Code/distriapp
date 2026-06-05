import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { passOk, setupPass, lock } from '../../lib/auth'

export default function Config() {
  const { cfg, saveCfg } = useStore()
  const [form, setForm] = useState({ ...cfg })
  const [cp1, setCp1] = useState('')
  const [cp2, setCp2] = useState('')
  const [cp3, setCp3] = useState('')

  function handleSaveCfg() {
    if (!form.empresa.trim()) { alert('Ingresa el nombre de la empresa'); return }
    saveCfg(form)
    alert('Datos guardados')
  }

  function handleChangePass() {
    if (!passOk(cp1)) { alert('Contraseña actual incorrecta.'); return }
    if (cp2.length < 4) { alert('Mínimo 4 caracteres.'); return }
    if (cp2 !== cp3) { alert('Las contraseñas no coinciden.'); return }
    setupPass(cp2)
    alert('Contraseña cambiada. Volverás al login.')
    lock()
  }

  return (
    <div className="max-w-md flex flex-col gap-4">
      <div className="section-header">
        <span className="section-title">Datos de la empresa</span>
      </div>

      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex flex-col gap-3">
        <div className="form-col">
          <label className="label">Nombre / Razón Social</label>
          <input className="input" value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} placeholder="Mi Distribuidora" />
        </div>
        <div className="form-col">
          <label className="label">Dirección</label>
          <input className="input" value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))} placeholder="Av. Principal 123" />
        </div>
        <div className="form-col">
          <label className="label">Teléfono</label>
          <input className="input" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="299-000-0000" />
        </div>
        <div className="form-col">
          <label className="label">CUIT</label>
          <input className="input" value={form.cuit} onChange={e => setForm(p => ({ ...p, cuit: e.target.value }))} placeholder="30-00000000-0" />
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleSaveCfg}>Guardar datos empresa</button>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 flex flex-col gap-3">
        <div className="font-medium text-sm">Cambiar contraseña</div>
        <div className="form-col">
          <label className="label">Contraseña actual</label>
          <input className="input" type="password" value={cp1} onChange={e => setCp1(e.target.value)} placeholder="Contraseña actual" />
        </div>
        <div className="form-col">
          <label className="label">Nueva contraseña</label>
          <input className="input" type="password" value={cp2} onChange={e => setCp2(e.target.value)} placeholder="Mínimo 4 caracteres" />
        </div>
        <div className="form-col">
          <label className="label">Confirmar nueva</label>
          <input className="input" type="password" value={cp3} onChange={e => setCp3(e.target.value)} placeholder="Repetir nueva contraseña" />
        </div>
        <div>
          <button className="btn btn-warning" onClick={handleChangePass}>Cambiar contraseña</button>
        </div>
      </div>

      <div className="text-xs text-stone-400 leading-relaxed p-3 bg-stone-100 dark:bg-stone-800 rounded-lg">
        Los datos de empresa aparecen en el encabezado de los tickets. Todo se guarda en este navegador/dispositivo.
      </div>
    </div>
  )
}
