import Link from "next/link";

const tabs = [
  { href: "/portal/medical-policies/new", label: "New Policies" },
  { href: "/portal/medical-policies/renew", label: "Renew Policies" },
  { href: "/portal/medical-policies/group", label: "Group Policies" },
];

export default function MedicalPoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">Medical Policies</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Issue and manage policies.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors"
          >
            {t.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}

