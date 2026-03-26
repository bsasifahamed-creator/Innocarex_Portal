"use client";

import { useEffect, useState } from "react";
import type { IntegrationContract } from "@/lib/integrations/contracts";

type StatusPayload = {
  ok: boolean;
  integrations: Array<{
    id: string;
    displayName: string;
    sowModuleIds: number[];
    configured: boolean;
    requiredKeysPresent: Record<string, boolean>;
  }>;
  note?: string;
};

export default function IntegrationStatusSection({
  contract,
  moduleCriteria,
}: {
  contract: IntegrationContract;
  moduleCriteria: string[];
}) {
  const [row, setRow] = useState<StatusPayload["integrations"][0] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/integrations/status");
        const j = (await r.json()) as StatusPayload;
        const found = j.integrations?.find((i) => i.id === contract.id) ?? null;
        if (!cancelled) {
          if (!r.ok) setErr("Could not load status.");
          else setRow(found);
        }
      } catch {
        if (!cancelled) setErr("Network error.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contract.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">SOW acceptance criteria</h2>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
          {moduleCriteria.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Technical contract</h2>
        <p className="text-sm text-slate-600">{contract.description}</p>
        <p className="text-xs text-slate-400 mt-3 font-mono">Required env: {contract.requiredEnvKeys.join(", ")}</p>
      </div>

      {err ? <p className="text-red-600 text-sm">{err}</p> : null}
      {row ? (
        <div
          className={`rounded-xl border px-4 py-3 ${
            row.configured ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="font-semibold text-slate-900">{row.displayName}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-800 mt-1">
            {row.configured ? "Required keys present" : "Not configured"}
          </p>
        </div>
      ) : !err ? (
        <p className="text-sm text-slate-500">Loading configuration status</p>
      ) : null}
    </div>
  );
}
