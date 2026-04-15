'use client'
import Link from 'next/link'
import type { PurchaseState } from '../page'

interface Props {
  state:   PurchaseState
  onReset: () => void
}

export default function Confirmation({ state, onReset }: Props) {
  const maskName = (name: string) => {
    const parts = name.trim().split(' ')
    return parts.map(p => p.charAt(0).toUpperCase() + '*'.repeat(Math.max(p.length - 1, 1))).join(' ')
  }

  return (
    <div>
      {/* Success header */}
      <div className="text-center py-6 mb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="text-5xl mb-3">✅</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Purchase Complete</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Both cards are being issued and delivered to the member.
        </p>
      </div>

      {/* Transaction summary */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Transaction Ref</span>
          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
            {state.transactionRef ?? '—'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Member</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {maskName(state.kyc.fullName)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">Plan</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {state.bundleName} — {state.tierName}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-600 pt-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Amount Paid</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            AED {state.totalAmount?.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500">
          Split: Raha AED {state.rahaSplit} · ABNIC AED {state.abnicSplit}
        </div>
      </div>

      {/* Card delivery status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🌟</span>
            <span className="font-semibold text-teal-800 dark:text-teal-300 text-sm">Raha Loyalty Card</span>
          </div>
          <div className="text-xs text-teal-600 dark:text-teal-400 mb-3">
            {state.rahaCardUrl ? '✅ Card ready' : '⏳ Being generated — delivery within 60 seconds'}
          </div>
          {state.rahaCardUrl ? (
            <a href={state.rahaCardUrl} target="_blank" rel="noopener noreferrer"
              className="block text-center py-1.5 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Download Card
            </a>
          ) : (
            <div className="text-xs text-center text-teal-500 dark:text-teal-400">
              WhatsApp + email delivery in progress
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🛡️</span>
            <span className="font-semibold text-blue-800 dark:text-blue-300 text-sm">ABNIC Insurance Card</span>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mb-3">
            {state.abnicCardUrl ? '✅ Card ready' : '⏳ Being generated — delivery within 90 seconds'}
          </div>
          {state.abnicCardUrl ? (
            <a href={state.abnicCardUrl} target="_blank" rel="noopener noreferrer"
              className="block text-center py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Download Card
            </a>
          ) : (
            <div className="text-xs text-center text-blue-500 dark:text-blue-400">
              WhatsApp + email delivery in progress
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300 mb-6">
        Cards are being sent to <strong>{state.kyc.whatsapp}</strong> and <strong>{state.kyc.email}</strong> via WhatsApp and email.
        If delivery is delayed, download links will appear above once ready.
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onReset}
          className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          New Purchase
        </button>
        <Link href="/portal/transactions"
          className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
          View Transactions
        </Link>
      </div>
    </div>
  )
}
