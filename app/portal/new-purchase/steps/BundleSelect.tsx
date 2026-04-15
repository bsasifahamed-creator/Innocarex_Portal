'use client'
import { useEffect, useState } from 'react'
import type { PurchaseState }  from '../page'

interface Bundle { id: string; name: string; displayName: string }
interface Props {
  state: PurchaseState; update: (p: Partial<PurchaseState>) => void
  onNext: () => void; onBack: () => void
}

export default function BundleSelect({ state, update, onNext, onBack }: Props) {
  const [bundles,  setBundles]  = useState<Bundle[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(state.bundleId)

  useEffect(() => {
    fetch('/api/products/affinity')
      .then(r => r.json())
      .then(d => { setBundles(d.bundles ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const choose = (b: Bundle) => {
    setSelected(b.id)
    update({ bundleId: b.id, bundleName: b.displayName })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Select Programme</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose the affinity programme bundle for this member.</p>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading programmes...</div>
      ) : bundles.length === 0 ? (
        <div className="text-red-500 text-sm">No active programmes found. Contact the platform operator.</div>
      ) : (
        <div className="space-y-3">
          {bundles.map(b => (
            <button key={b.id} onClick={() => choose(b)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selected === b.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 hover:border-blue-300 dark:border-slate-700'
              }`}>
              <div className="font-semibold text-slate-900 dark:text-white">{b.displayName}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Loyalty card + embedded insurance · Core / Pulse / Zenith tiers
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">Back</button>
        <button onClick={onNext} disabled={!selected}
          className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Continue
        </button>
      </div>
    </div>
  )
}
