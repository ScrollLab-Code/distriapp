import { useState, useEffect } from 'react'
import { sessOk } from './lib/auth'
import { useStore } from './store/useStore'
import LoginScreen from './components/LoginScreen'
import AppLayout from './components/AppLayout'

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const { loadData } = useStore()

  useEffect(() => {
    const ok = sessOk()
    if (ok) {
      loadData()
      setAuthed(true)
    } else {
      setAuthed(false)
    }
  }, [])

  if (authed === null) return null

  if (!authed) {
    return (
      <LoginScreen
        onSuccess={() => {
          loadData()
          setAuthed(true)
        }}
      />
    )
  }

  return <AppLayout />
}
