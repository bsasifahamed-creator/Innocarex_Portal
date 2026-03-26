"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PolicyRow = {
  policy_number: string;
  status: string;
  member_name_en: string;
  insurer: string;
  plan_name: string;
  annual_premium_aed: number;
  issued_at: string;
};

export default function NewPoliciesPage() {
  const [policies, setPolicies] = useState<PolicyRow[] | null>(null);
  const [persistence, setPersistence] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/policies", { credentials: "include" });
        const j = (await r.json()) as { policies?: PolicyRow[]; persistence?: boolean; message?: string };
        if (cancelled) return;
        if (!r.ok) {
          setErr(r.status === 401 ? "Sign in required." : "Could not load policies.");
          setPolicies([]);
          return;
        }
        setPolicies(j.policies ?? []);
        setPersistence(j.persistence ?? false);
        setMessage(j.message || "");
      } catch {
        if (!cancelled) setErr("Network error.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {err ? <p className="text-red-600 text-sm">{err}</p> : null}
      {message ? (
        <p className="text-amber-800 dark:text-amber-200 text-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-2">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Issued policies are listed here (when database is enabled).
        </p>
        <Link
          href="/portal/medical-quotes/new"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
        >
          New quotation
        </Link>
      </div>

      {persistence === false && !err ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-10 text-center text-slate-600 dark:text-slate-300">
          Database not configured. Policies are not persisted.
        </div>
      ) : null}

      {policies && policies.length === 0 && persistence && !err ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-10 text-center text-slate-600 dark:text-slate-300">
          No policies yet. Issue from a quotation.
        </div>
      ) : null}

      {policies && policies.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/40 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Insurer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {policies.map((p) => (
                <tr key={p.policy_number} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-3 font-mono text-xs">{p.policy_number}</td>
                  <td className="px-4 py-3">{p.member_name_en}</td>
                  <td className="px-4 py-3">{p.insurer}</td>
                  <td className="px-4 py-3">{p.plan_name}</td>
                  <td className="px-4 py-3">AED {p.annual_premium_aed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(p.issued_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

