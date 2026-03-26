"use client";

import { useState } from "react";

type Note = { id: string; title: string; body: string; ts: string };

const seed: Note[] = [
  { id: "n1", title: "Policy issued", body: "A policy was issued from a new quotation.", ts: new Date().toISOString() },
  { id: "n2", title: "Integration keys", body: "Integration configuration keys can be added in .env.local.", ts: new Date().toISOString() },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<Note[]>(seed);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">System messages and workflow alerts.</p>
        </div>
        <button
          type="button"
          onClick={() => setItems([])}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          Clear all
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-10 text-center text-slate-600 dark:text-slate-300">
          No notifications.
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {items.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-5"
            >
              <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{n.body}</p>
              <p className="text-xs text-slate-400 mt-3">{new Date(n.ts).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

