"use client";

import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import InView from "@/components/ui/InView";

const articles = [
  {
    cat: "Market",
    title: "What brokers should expect from 2026 network changes",
    read: "6 min read",
  },
  {
    cat: "Operations",
    title: "Designing approval queues that scale with typing centres",
    read: "5 min read",
  },
];

export default function Insights() {
  return (
    <section id="insights" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24">
      <InView>
        <SectionLabel text="Insights" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-10">
          Latest thinking
        </h2>
      </InView>

      <InView className="mb-6">
        <Link
          href="https://www.linkedin.com/company/"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-3xl overflow-hidden bg-slate-900 p-8 md:p-12 min-h-[280px] md:min-h-[320px] flex flex-col justify-end border border-slate-800 hover:border-slate-700 transition-all relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <span className="absolute top-6 right-8 text-[8rem] md:text-[12rem] font-black text-white pointer-events-none select-none opacity-5 leading-none">
            in
          </span>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-blue text-white text-xs font-bold uppercase tracking-wide mb-4">
              Opportunity
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-2">
              Follow InnoCare X on LinkedIn
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Product updates, regulatory notes, and partner spotlights.
            </p>
            <span className="inline-flex items-center gap-2 text-white text-sm font-semibold">
              Visit LinkedIn
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
          </div>
        </Link>
      </InView>

      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((a, i) => (
          <InView key={a.title} delay={i * 0.06}>
            <article className="rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:-translate-y-1 transition-all bg-white">
              <div className="h-48 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                <span className="absolute top-4 right-4 text-6xl font-black text-slate-200">
                  {String(i + 2).padStart(2, "0")}
                </span>
              </div>
              <div className="p-6 md:p-8">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wide mb-3">
                  {a.cat}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mb-4">{a.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">{a.read}</span>
                  <span className="text-brand-blue font-semibold text-sm inline-flex items-center gap-1 group cursor-pointer">
                    Read
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            </article>
          </InView>
        ))}
      </div>
    </section>
  );
}
