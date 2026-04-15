'use client'
import { useState } from 'react'
import type { PurchaseState } from '../page'

interface Props {
  state:  PurchaseState
  update: (p: Partial<PurchaseState>) => void
  onNext: () => void
  onBack: () => void
}

export default function PaymentSummary({ state, update, onNext, onBack }: Props) {
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [agreed,    setAgreed]    = useState(false)

  const handlePay = async () => {
    if (!agreed) { setError('Please confirm the declaration before proceeding.'); return }
    setLoading(true)
    setError(null)

    try {
      // Create transaction record
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId:         state.tierId,
          programmeBundle:state.bundleName,
          kyc: {
            fullName:    state.kyc.fullName,
            whatsapp:    state.kyc.whatsapp,
            email:       state.kyc.email,
            dateOfBirth: state.kyc.dateOfBirth,
            sponsorId:   state.kyc.sponsorId,
            emiratesId:  state.kyc.emiratesId,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.isDuplicate) {
          const proceed = window.confirm(
            `A recent transaction already exists for this member with the same plan (ref: ${data.existingRef}).\n\nProceed anyway?`
          )
          if (!proceed) { setLoading(false); return }
        } else {
          setError(data.error ?? 'Failed to create transaction. Please try again.')
          setLoading(false)
          return
        }
      }

      update({
        transactionId:  data.transaction?.id,
        transactionRef: data.transaction?.reference,
      })

      // For Phase 1 — simulate payment confirmation and move to confirmation
      // In production this will redirect to payment gateway URL
      await new Promise(r => setTimeout(r, 1500))
      onNext()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const tierColour = state.tierName === 'ZENITH' ? 'text-teal-600' : state.tierName === 'PULSE' ? 'text-blue-600' : 'text-slate-600'

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Payment Summary</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Review the details below before proceeding to payment.
      </p>

      {/* Summary card */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Programme</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{state.bundleName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Plan Tier</span>
          <span className={`text-sm font-bold ${tierColour}`}>{state.tierName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Member</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{state.kyc.fullName}</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Raha portion</span>
            <span className="text-sm text-slate-700 dark:text-slate-300">AED {state.rahaSplit?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">ABNIC portion</span>
            <span className="text-sm text-slate-700 dark:text-slate-300">AED {state.abnicSplit?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-600 pt-2 mt-2">
            <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              AED {state.totalAmount?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Declaration */}
      <label className="flex items-start gap-3 cursor-pointer mb-5">
        <input
          type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          I confirm that all member details entered are accurate and the member has consented to this purchase.
          I understand that the payment will be split between Raha and ABNIC as shown above.
        </span>
      </label>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading}
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40">
          Back
        </button>
        <button onClick={handlePay} disabled={loading || !agreed}
          className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
          ) : (
            <>Pay AED {state.totalAmount?.toLocaleString()} →</>
          )}
        </button>
      </div>
    </div>
  )
}
