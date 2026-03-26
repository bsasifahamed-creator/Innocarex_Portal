"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/portal/ThemeToggle";

const nav = {
  dashboard: { href: "/portal", label: "Dashboard" },
  profile: { href: "/portal/profile", label: "Profile" },
  notifications: { href: "/portal/notifications", label: "Notifications" },
  medicalQuotes: {
    label: "Medical Quotes",
    items: [
      { href: "/portal/medical-quotes/new", label: "New Quotations" },
      { href: "/portal/medical-quotes/renew", label: "Renew Quotations" },
      { href: "/portal/medical-quotes/refer", label: "Refer Quotations" },
    ],
  },
  medicalPolicies: {
    label: "Medical Policies",
    items: [
      { href: "/portal/medical-policies/new", label: "New Policies" },
      { href: "/portal/medical-policies/renew", label: "Renew Policies" },
      { href: "/portal/medical-policies/group", label: "Group Policies" },
    ],
  },
  reports: {
    label: "Reports",
    items: [
      { href: "/portal/reports/production", label: "Production Report" },
      { href: "/portal/reports/financial", label: "Financial Report" },
    ],
  },
} as const;

export default function PortalHeader() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 px-4 md:px-6 py-3">
      <nav className="max-w-7xl mx-auto bg-white/90 dark:bg-slate-950/70 backdrop-blur-xl border border-white/40 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-black/30 rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <Link href="/portal" className="flex items-center gap-3 shrink-0">
          <div className="h-10 md:h-12">
            <Image
              src="/Logo.png"
              alt="InnoCare X"
              width={180}
              height={64}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-2">
          <Link
            href={nav.dashboard.href}
            className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
          >
            {nav.dashboard.label}
          </Link>

          <div className="relative group">
            <button
              type="button"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors inline-flex items-center gap-1"
            >
              {nav.medicalQuotes.label}
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full mt-2 w-56 rounded-2xl border border-white/40 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl shadow-xl p-2">
              {nav.medicalQuotes.items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors inline-flex items-center gap-1"
            >
              {nav.medicalPolicies.label}
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full mt-2 w-56 rounded-2xl border border-white/40 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl shadow-xl p-2">
              {nav.medicalPolicies.items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors inline-flex items-center gap-1"
            >
              {nav.reports.label}
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-150 absolute left-0 top-full mt-2 w-56 rounded-2xl border border-white/40 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl shadow-xl p-2">
              {nav.reports.items.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={nav.notifications.href}
            className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
          >
            {nav.notifications.label}
          </Link>

          <Link
            href={nav.profile.href}
            className="px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
          >
            {nav.profile.label}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
