import { useState, useRef, useEffect } from 'react'
import { sessSet, passOk, setupPass, hasPass } from '../lib/auth'

interface Props {
  onSuccess: () => void
}

export default function LoginScreen({ onSuccess }: Props) {
  const first = !hasPass()
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [err, setErr] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSetup() {
    if (p1.length < 4) { setErr('Mínimo 4 caracteres.'); return }
    if (p1 !== p2) { setErr('No coinciden.'); return }
    setupPass(p1)
    sessSet()
    onSuccess()
  }

  function handleLogin() {
    if (passOk(p1)) {
      sessSet()
      onSuccess()
    } else {
      setErr('Contraseña incorrecta.')
      setP1('')
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5 bg-stone-100 dark:bg-stone-900">
      <div className="bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-2xl p-9 w-full max-w-sm flex flex-col gap-4 shadow-xl">
        <div className="text-center">
          <img src="/logo.png" alt="DistribApp" className="h-14 w-auto object-contain mx-auto mb-2" />
          <div className="text-sm text-stone-500 dark:text-stone-400">
            {first ? 'Crear contraseña' : 'Iniciar sesión'}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <input
            ref={inputRef}
            type="password"
            className="input"
            placeholder={first ? 'Nueva contraseña (mín. 4 caracteres)' : 'Contraseña'}
            value={p1}
            onChange={e => setP1(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !first) handleLogin() }}
          />
          {first && (
            <input
              type="password"
              className="input"
              placeholder="Repetir contraseña"
              value={p2}
              onChange={e => setP2(e.target.value)}
            />
          )}
        </div>

        <button
          className="btn btn-primary w-full justify-center py-3 text-sm"
          onClick={first ? handleSetup : handleLogin}
        >
          {first ? 'Crear contraseña' : 'Entrar'}
        </button>

        {err && <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">{err}</p>}
      </div>
    </div>
  )
}
