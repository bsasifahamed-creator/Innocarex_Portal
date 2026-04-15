'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Txn {
  id: string; reference: string; status: string
  totalAmountAed: string; programmeBundle: string
  createdAt: string; rahaCardUrl: string | null; abnicCardUrl: string | null
  memberKyc: { fullName: string } | null
}

interface Stats {
  totalToday: number; totalMonth: number
  totalRevenue: number; byTier: Record<string, number>
}

function maskName(name: string) {
  const parts = name.trim().split(' ')
  return parts.map(p => p.charAt(0).toUpperCase() + '*'.repeat(Math.max(p.length - 1, 1))).join(' ')
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETE:          'bg-teal-100 text-teal-700',
    PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-700',
    PENDING_PAYMENT:   'bg-amber-100 text-amber-700',
    FAILED:            'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default function SuperUserDashboard() {
  const [txns,    setTxns]    = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(d => { setTxns(d.transactions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const today   = new Date().toDateString()
  const todayTx = txns.filter(t => new Date(t.createdAt).toDateString() === today)
  const revenue = txns.reduce((sum, t) => sum + Number(t.totalAmountAed), 0)

  const exportCSV = () => {
    const rows = [
      ['Reference','Member','Bundle','Amount','Status','Date'],
      ...txns.map(t => [
        t.reference,
        t.memberKyc ? maskName(t.memberKyc.fullName) : '—',
        t.programmeBundle ?? '—',
        Number(t.totalAmountAed).toFixed(2),
        t.status,
        new Date(t.createdAt).toLocaleDateString(),
      ])
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'transactions.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organisation-wide view</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            Export CSV
          </button>
          <Link href="/portal/new-purchase"
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            + New Purchase
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's transactions", value: todayTx.length,                        colour: "text-blue-600 dark:text-blue-400"  },
          { label: "Total this month",     value: txns.length,                            colour: "text-teal-600 dark:text-teal-400"  },
          { label: "Total revenue (AED)",  value: `AED ${revenue.toLocaleString()}`,      colour: "text-purple-600 dark:text-purple-400" },
          { label: "Complete rate",        value: txns.length ? `${Math.round(txns.filter(t=>t.status==='COMPLETE').length/txns.length*100)}%` : '—', colour: "text-slate-900 dark:text-white" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className={`text-2xl font-bold ${s.colour}`}>{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transaction table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 dark:text-white">All Transactions</h2>
          <span className="text-xs text-slate-400">{txns.length} total</span>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : txns.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet across your organisation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase">
                <tr>
                  {['Reference','Member','Plan','Amount','Status','Date','Cards'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {txns.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{t.reference}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.memberKyc ? maskName(t.memberKyc.fullName) : '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.programmeBundle?.replace('_',' ') ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">AED {Number(t.totalAmountAed).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {t.rahaCardUrl && <a href={t.rahaCardUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded">Raha</a>}
                        {t.abnicCardUrl && <a href={t.abnicCardUrl} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">ABNIC</a>}
                        {!t.rahaCardUrl && !t.abnicCardUrl && <span className="text-xs text-slate-400">Pending</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
