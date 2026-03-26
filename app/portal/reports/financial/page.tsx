"use client";

export default function FinancialReportPage() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-6">
      <h2 className="text-lg font-extrabold font-display text-slate-900 dark:text-white">Financial Report</h2>
      <p className="text-slate-600 dark:text-slate-300 mt-2">
        This report will be generated from premiums, payments, commissions, and policy lifecycle events.
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
        No data source wired yet.
      </div>
    </div>
  );
}

