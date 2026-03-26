import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
            Overview and quick actions.
          </p>
        </div>
        <Link
          href="/portal/profile"
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          View profile
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-6">
          <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">Today</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">?</p>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Quotes created</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-6">
          <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">Today</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">?</p>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Policies issued</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-6">
          <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">Queue</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">?</p>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Pending actions</p>
        </div>
      </div>
    </div>
  );
}
