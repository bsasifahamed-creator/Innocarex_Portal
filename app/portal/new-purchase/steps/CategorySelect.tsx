'use client'
import type { PurchaseState } from '../page'

interface Props {
  state:  PurchaseState
  update: (p: Partial<PurchaseState>) => void
  onNext: () => void
}

export default function CategorySelect({ state, update, onNext }: Props) {
  const select = (cat: 'affinity' | 'standard') => {
    update({ category: cat })
    onNext()
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
        Select Product Category
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Choose the type of product you want to sell to the member.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => select('affinity')}
          className="p-6 rounded-xl border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 text-left transition-all group"
        >
          <div className="text-2xl mb-3">🌟</div>
          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
            Affinity / Wellness Programme
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Raha loyalty card bundled with ABNIC insurance coverage. Core, Pulse, or Zenith tiers.
          </div>
          <div className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400">
            ✦ Primary Phase 1 product
          </div>
        </button>

        <button
          onClick={() => select('standard')}
          className="p-6 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-800 text-left transition-all group opacity-60"
          disabled
        >
          <div className="text-2xl mb-3">🛡️</div>
          <div className="font-semibold text-slate-900 dark:text-white">
            Standard Insurance
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fixed-premium insurance plans without loyalty bundle.
          </div>
          <div className="mt-3 text-xs font-semibold text-slate-400">
            Coming in Phase 2
          </div>
        </button>
      </div>
    </div>
  )
}
