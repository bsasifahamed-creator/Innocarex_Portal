'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Txn {
  id: string; reference: string; status: string
  totalAmountAed: string; programmeBundle: string
  createdAt: string; completedAt: string | null
  rahaCardUrl: string | null; abnicCardUrl: string | null
  memberKyc: { fullName: string } | null
}

function maskName(name: string) {
  return name.trim().split(' ')
    .map(p => p.charAt(0).toUpperCase() + '*'.repeat(Math.max(p.length - 1, 1)))
    .join(' ')
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETE:          'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    PAYMENT_CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    PENDING_PAYMENT:   'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    PENDING_KYC:       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    FAILED:            'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    FLAGGED:           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    RAHA_PROCESSING:   'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    ABNIC_PROCESSING:  'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default function TransactionsPage() {
  const [txns,    setTxns]    = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetch('/api/transactions')
      .then(r => r.json())
      .then(d => { setTxns(d.transactions ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = txns.filter(t =>
    t.reference.toLowerCase().includes(search.toLowerCase()) ||
    (t.memberKyc?.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (t.programmeBundle ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const rows = [
      ['Reference', 'Member', 'Bundle', 'Amount (AED)', 'Status', 'Date', 'Raha Card', 'ABNIC Card'],
      ...filtered.map(t => [
        t.reference,
        t.memberKyc ? maskName(t.memberKyc.fullName) : '—',
        t.programmeBundle ?? '—',
        Number(t.totalAmountAed).toFixed(2),
        t.status,
        new Date(t.createdAt).toLocaleDateString(),
        t.rahaCardUrl  ?? 'Pending',
        t.abnicCardUrl ?? 'Pending',
      ])
    ]
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
            Export CSV
          </button>
          <Link href="/portal/new-purchase"
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm">
            + New Purchase
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by reference, member name, or bundle..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {search ? 'No transactions match your search.' : 'No transactions yet.'}
            </p>
            {!search && (
              <Link href="/portal/new-purchase"
                className="text-sm font-semibold text-blue-600 hover:underline">
                Start your first purchase →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {['Reference', 'Member', 'Bundle', 'Amount', 'Status', 'Date', 'Cards'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.reference}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {t.memberKyc ? maskName(t.memberKyc.fullName) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {t.programmeBundle?.replace(/_/g, ' ') ?? '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      AED {Number(t.totalAmountAed).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {new Date(t.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {t.rahaCardUrl ? (
                          <a href={t.rahaCardUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 rounded font-medium hover:bg-teal-200">
                            Raha ↗
                          </a>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 dark:bg-slate-800 rounded">
                            Raha pending
                          </span>
                        )}
                        {t.abnicCardUrl ? (
                          <a href={t.abnicCardUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded font-medium hover:bg-blue-200">
                            ABNIC ↗
                          </a>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 dark:bg-slate-800 rounded">
                            ABNIC pending
                          </span>
                        )}
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
