'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Txn {
  id: string; reference: string; status: string
  totalAmountAed: string; programmeBundle: string
  createdAt: string; rahaCardUrl: string | null; abnicCardUrl: string | null
  memberKyc: { fullName: string } | null
}

function maskName(name: string) {
  const parts = name.trim().split(' ')
  return parts.map(p => p.charAt(0).toUpperCase() + '*'.repeat(Math.max(p.length - 1, 1))).join(' ')
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETE:          'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    PENDING_PAYMENT:   'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    FAILED:            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    FLAGGED:           'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default function SubUserDashboard() {
  const [txns,    setTxns]    = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(d => { setTxns(d.transactions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const today = txns.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length
  const month = txns.length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your transactions</p>
        </div>
        <Link href="/portal/new-purchase"
          className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm">
          + New Purchase
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{today}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Today&apos;s transactions</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{month}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Month to date</div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h2>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : txns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No transactions yet.</p>
            <Link href="/portal/new-purchase" className="text-sm font-semibold text-blue-600 hover:underline">
              Start your first purchase →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {txns.map(t => (
              <div key={t.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {t.memberKyc ? maskName(t.memberKyc.fullName) : '—'}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-xs text-slate-400">
                    {t.reference} · {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    AED {Number(t.totalAmountAed).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">{t.programmeBundle?.replace('_', ' ') ?? '—'}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {t.rahaCardUrl && (
                    <a href={t.rahaCardUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 rounded font-medium hover:bg-teal-200">
                      Raha
                    </a>
                  )}
                  {t.abnicCardUrl && (
                    <a href={t.abnicCardUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded font-medium hover:bg-blue-200">
                      ABNIC
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
