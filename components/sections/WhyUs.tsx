"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import InView from "@/components/ui/InView";

const items = [
  {
    title: "Unified marketplace",
    body: "One screen for plans, pricing, and insurer-specific rules.",
    icon: "handshake",
    grad: "from-slate-800 to-slate-900 shadow-slate-400/20",
  },
  {
    title: "Operational rigor",
    body: "Approvals, SLAs, and audit trails built for regulated distribution.",
    icon: "verified",
    grad: "from-brand-blue to-primary shadow-blue-400/20",
  },
  {
    title: "Speed to card",
    body: "Enrollment events trigger digital cards without another portal hop.",
    icon: "lightbulb",
    grad: "from-brand-teal to-emerald-500 shadow-teal-400/20",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24 bg-slate-900">
      <InView>
        <div className="text-center max-w-3xl mx-auto mb-14">
          <SectionLabel text="Why Us" className="justify-center w-full" />
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-white">
            Why InnoCare X
          </h2>
        </div>
      </InView>
      <div className="grid md:grid-cols-3 gap-8 md:gap-6">
        {items.map((it, i) => (
          <InView key={it.title} delay={i * 0.08}>
            <div className="flex flex-col items-center text-center group">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${it.grad} text-white shadow-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
              >
                <span className="material-symbols-outlined text-3xl">{it.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-blue transition-colors">
                {it.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{it.body}</p>
            </div>
          </InView>
        ))}
      </div>
    </section>
  );
}
