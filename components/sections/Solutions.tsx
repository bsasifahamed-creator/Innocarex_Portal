"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const solutions = [
  {
    icon: "monitor_heart",
    n: "01",
    title: "Core distribution",
    desc: "Quotation, underwriting data capture, and plan comparison across insurers.",
    blob: "bg-brand-blue",
    bullets: ["Live premium matrix", "Eligibility guardrails", "Quote-to-policy handoff"],
  },
  {
    icon: "medical_information",
    n: "02",
    title: "Enrollment intelligence",
    desc: "Validated identity capture, dependent linking, and document integrity.",
    blob: "bg-indigo-500",
    bullets: ["MRZ and barcode pipelines", "Cross-document checks", "Cache-aware re-uploads"],
  },
  {
    icon: "psychology",
    n: "03",
    title: "Partner experience",
    desc: "Broker and typing centre workspaces tuned for speed and clarity.",
    blob: "bg-brand-teal",
    bullets: ["Role dashboards", "SLA visibility", "Commission-ready exports"],
  },
  {
    icon: "hub",
    n: "04",
    title: "Integration fabric",
    desc: "Insurer and TPA adapters with retries, observability, and audit logs.",
    blob: "bg-purple-500",
    bullets: ["REST connectors", "Async jobs", "Regulatory export packs"],
  },
];

export default function Solutions() {
  return (
    <section
      id="solutions"
      className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24 bg-slate-50/50"
    >
      <InView>
        <SectionLabel text="Platform" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-12">
          Our <GradientText>Solutions</GradientText>
        </h2>
      </InView>
      <div className="space-y-4">
        {solutions.map((s, i) => (
          <InView key={s.n} delay={i * 0.06}>
            <div className="group rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/30 transition-all duration-500">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 p-8 md:p-10 relative overflow-hidden shrink-0">
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 duration-700 ${s.blob}`}
                  />
                  <span className="absolute top-2 right-4 text-[7rem] md:text-[8rem] font-black text-white pointer-events-none select-none opacity-[0.03] leading-none">
                    {s.n}
                  </span>
                  <div className="w-11 h-11 rounded-xl border border-white/10 bg-brand-blue/10 flex items-center justify-center mb-5 relative z-10">
                    <span className="material-symbols-outlined text-white">{s.icon}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight mb-3 relative z-10">
                    {s.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">{s.desc}</p>
                </div>
                <div className="md:w-3/5 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-800/60">
                  <ul className="space-y-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-teal/50 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </InView>
        ))}
      </div>
    </section>
  );
}
