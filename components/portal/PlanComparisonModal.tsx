'use client'

interface Tier {
  id: string; tierName: 'CORE' | 'PULSE' | 'ZENITH'
  totalAmountAed: number; rahaSplitAed: number; insurerSplitAed: number
  description: string; benefits: Record<string, any>
}

interface Props {
  isOpen:        boolean
  tiers:         Tier[]
  selectedTierId:string | null
  onSelect:      (tier: 'CORE' | 'PULSE' | 'ZENITH') => void
  onClose:       () => void
}

const ROWS = [
  { label: 'Annual Premium',       key: (t: Tier) => `AED ${Number(t.totalAmountAed).toLocaleString()}` },
  { label: 'Raha Portion',         key: (t: Tier) => `AED ${Number(t.rahaSplitAed)}` },
  { label: 'ABNIC Portion',        key: (t: Tier) => `AED ${Number(t.insurerSplitAed)}` },
  { label: 'Coverage Level',       key: (t: Tier) => t.benefits?.coverageLevel ?? '—' },
  { label: 'Outpatient',           key: (t: Tier) => t.benefits?.outpatient ?? '—' },
  { label: 'Hospitalisation',      key: (t: Tier) => t.benefits?.hospitalisation ?? '—' },
  { label: 'Pharmacy Discount',    key: (t: Tier) => t.benefits?.pharmacyDiscount ?? '—' },
  { label: 'Teleconsultation',     key: (t: Tier) => t.benefits?.teleconsultation ? '✅ Included' : '❌ Not included' },
  { label: 'Dental Discount',      key: (t: Tier) => t.benefits?.dentalDiscount ?? '—' },
]

const ICONS = { CORE: '🌱', PULSE: '💙', ZENITH: '⭐' }

export default function PlanComparisonModal({ isOpen, tiers, selectedTierId, onSelect, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Compare Plans</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Raha with ABNIC — full benefit breakdown</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            ✕
          </button>
        </div>

        {/* Tier headers */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {tiers.map(t => (
              <div key={t.id}
                className={`rounded-xl p-4 text-center border-2 transition-all ${
                  selectedTierId === t.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                <div className="text-2xl mb-1">{ICONS[t.tierName]}</div>
                <div className="font-bold text-slate-900 dark:text-white">{t.tierName}</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  AED {Number(t.totalAmountAed).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">per year</div>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
            {ROWS.map((row, i) => (
              <div key={row.label}
                className={`grid grid-cols-4 ${i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}>
                <div className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                  {row.label}
                </div>
                {tiers.map(t => (
                  <div key={t.id} className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-700">
                    {row.key(t)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Select buttons */}
          <div className="grid grid-cols-3 gap-3 pb-6">
            {tiers.map(t => (
              <button key={t.id} onClick={() => onSelect(t.tierName)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedTierId === t.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300'
                }`}>
                {selectedTierId === t.id ? '✓ Selected' : `Select ${t.tierName}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
