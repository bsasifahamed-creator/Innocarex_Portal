"use client";

import { useEffect, useState } from "react";

type MePayload = {
  ok: boolean;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const [me, setMe] = useState<MePayload | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const j = (await r.json()) as MePayload;
        if (!cancelled) {
          if (!r.ok) setErr("Could not load profile.");
          else setMe(j);
        }
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
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Profile</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">Your portal account details.</p>
      </div>

      {err ? <p className="text-red-600 text-sm">{err}</p> : null}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-6 max-w-xl">
        {me ? (
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <dt className="text-slate-500">Email</dt>
            <dd className="col-span-2 font-semibold text-slate-900 dark:text-white">{me.email}</dd>
            <dt className="text-slate-500">Role</dt>
            <dd className="col-span-2 font-semibold text-slate-900 dark:text-white">{me.role}</dd>
          </dl>
        ) : (
          <p className="text-slate-500 text-sm">Loading…</p>
        )}
      </div>
    </div>
  );
}

