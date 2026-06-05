import { useState } from 'react'
import { useStore } from '../store/useStore'
import { TabId } from '../types'
import { stk } from '../lib/utils'
import { lock } from '../lib/auth'
import Stock from './modules/Stock'
import Remitos from './modules/Remitos'
import Clientes from './modules/Clientes'
import Cobros from './modules/Cobros'
import Caja from './modules/Caja'
import Precios from './modules/Precios'
import Pedido from './modules/Pedido'
import Config from './modules/Config'

const TABS: { id: TabId; label: string }[] = [
  { id: 'stock', label: 'Stock' },
  { id: 'remitos', label: 'Remitos' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'cobros', label: 'Cobros' },
  { id: 'caja', label: 'Caja' },
  { id: 'precios', label: 'Precios' },
  { id: 'pedido', label: 'Pedido' },
  { id: 'config', label: 'Empresa' },
]

function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case 'stock': return <Stock />
    case 'remitos': return <Remitos />
    case 'clientes': return <Clientes />
    case 'cobros': return <Cobros />
    case 'caja': return <Caja />
    case 'precios': return <Precios />
    case 'pedido': return <Pedido />
    case 'config': return <Config />
  }
}

export default function AppLayout() {
  const { tab, setTab, prods } = useStore()
  const [_tick, setTick] = useState(0)

  const stockAlerts = prods.filter(p => stk(p.q, p.m) !== 'k').length
  const vencAlerts = prods.filter(p => p.venc && (() => { const d = new Date(p.venc), n = new Date(); n.setHours(0,0,0,0); return Math.round((d.getTime()-n.getTime())/864e5) })() <= 30 && (() => { const d = new Date(p.venc), n = new Date(); n.setHours(0,0,0,0); return Math.round((d.getTime()-n.getTime())/864e5) })() >= 0).length
  const totalBadge = stockAlerts + vencAlerts

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex items-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl mb-5 overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-stone-200 dark:border-stone-700 whitespace-nowrap">
            <img src="/logo.png" alt="DistribApp" className="h-8 w-auto object-contain" />
          </div>
          <nav className="flex flex-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setTick(x => x + 1) }}
                className={[
                  'px-3 py-3 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors',
                  tab === t.id
                    ? 'text-brand-700 dark:text-brand-500 border-brand-700 dark:border-brand-500'
                    : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-800 dark:hover:text-stone-100',
                ].join(' ')}
              >
                {t.label}
                {t.id === 'stock' && totalBadge > 0 && (
                  <span className="ml-1 bg-red-600 text-white text-[10px] px-1.5 py-0 rounded-full font-bold">{totalBadge}</span>
                )}
              </button>
            ))}
          </nav>
          <button
            className="px-4 py-3 text-[11px] text-stone-400 border-l border-stone-200 dark:border-stone-700 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            onClick={() => { if (confirm('¿Cerrar sesión?')) lock() }}
          >
            Salir
          </button>
        </div>
        <main>
          <TabContent tab={tab} />
        </main>
      </div>
      <div id="printArea" />
    </div>
  )
}
