'use client'
import { useEffect, useState } from 'react'
import type { PurchaseState }  from '../page'
import PlanComparisonModal     from '@/components/portal/PlanComparisonModal'

interface Tier {
  id:              string
  tierName:        'CORE' | 'PULSE' | 'ZENITH'
  totalAmountAed:  number
  rahaSplitAed:    number
  insurerSplitAed: number
  planCode:        string
  description:     string
  benefits:        Record<string, any>
}

interface Props {
  state:  PurchaseState
  update: (p: Partial<PurchaseState>) => void
  onNext: () => void
  onBack: () => void
}

const TIER_COLOURS = {
  CORE:   { border: 'border-slate-300 dark:border-slate-600',  badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',  icon: '🌱' },
  PULSE:  { border: 'border-blue-300 dark:border-blue-700',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',       icon: '💙' },
  ZENITH: { border: 'border-teal-400 dark:border-teal-600',    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',       icon: '⭐' },
}

export default function TierSelect({ state, update, onNext, onBack }: Props) {
  const [tiers,    setTiers]    = useState<Tier[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<string | null>(state.tierId)
  const [modalOpen,setModalOpen]= useState(false)

  useEffect(() => {
    if (!state.bundleId) return
    fetch(`/api/products/affinity/${state.bundleId}/tiers`)
      .then(r => r.json())
      .then(d => { setTiers(d.tiers ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [state.bundleId])

  const choose = (t: Tier) => {
    setSelected(t.id)
    update({
      tierId:      t.id,
      tierName:    t.tierName,
      totalAmount: t.totalAmountAed,
      rahaSplit:   t.rahaSplitAed,
      abnicSplit:  t.insurerSplitAed,
      planCode:    t.planCode,
    })
  }

  const handleModalSelect = (tierName: 'CORE' | 'PULSE' | 'ZENITH') => {
    const t = tiers.find(x => x.tierName === tierName)
    if (t) { choose(t); setModalOpen(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Select Plan Tier</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Compare all tiers ↗
        </button>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {state.bundleName} · Choose the coverage level for this member.
      </p>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map(t => {
            const colours = TIER_COLOURS[t.tierName]
            const isSelected = selected === t.id
            return (
              <button
                key={t.id}
                onClick={() => choose(t)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : `${colours.border} hover:border-blue-400 hover:shadow-sm bg-white dark:bg-slate-900`
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <div className="text-2xl mb-2">{colours.icon}</div>
                <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${colours.badge}`}>
                  {t.tierName}
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">
                  AED {Number(t.totalAmountAed).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mb-3">per year</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.description}</p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div>🏥 {t.benefits?.coverageLevel ?? '—'} coverage</div>
                  <div>💊 {t.benefits?.pharmacyDiscount ?? '—'} pharmacy discount</div>
                  <div>{t.benefits?.teleconsultation ? '📱 Teleconsultation included' : '📱 No teleconsultation'}</div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                  Raha AED {Number(t.rahaSplitAed)} · ABNIC AED {Number(t.insurerSplitAed)}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setModalOpen(true) }}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
                  ⓘ View full comparison
                </button>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={onBack}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
          Back
        </button>
        <button onClick={onNext} disabled={!selected}
          className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
          Continue with {state.tierName ?? 'selected plan'}
        </button>
      </div>

      <PlanComparisonModal
        isOpen={modalOpen}
        tiers={tiers}
        selectedTierId={selected}
        onSelect={handleModalSelect}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
