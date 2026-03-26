"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const items = [
  { title: "Data residency", body: "UAE-first hosting patterns aligned to PDPL expectations.", icon: "gavel" },
  { title: "Observable systems", body: "Tracing across quotes, policies, and integration retries.", icon: "devices" },
  { title: "Fair economics", body: "Transparent commissions and typing-centre fee tracking.", icon: "savings" },
  { title: "Human escalation", body: "Policy leads can intervene without breaking audit trails.", icon: "verified" },
];

export default function Commitment() {
  return (
    <section id="commitment" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24">
      <div className="lg:flex lg:flex-row lg:items-center gap-12 lg:gap-20">
        <InView className="lg:w-2/5 mb-10 lg:mb-0">
          <SectionLabel text="Promise" />
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900">
            Our <GradientText>Commitment</GradientText>
          </h2>
          <p className="text-slate-600 mt-4 leading-relaxed">
            We build for regulated distribution: clear ownership, disciplined costs, and roadmaps you can explain to compliance.
          </p>
        </InView>
        <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((c, i) => (
            <InView key={c.title} delay={i * 0.06}>
              <div className="glass-card rounded-2xl p-6 md:p-7 flex items-start gap-4 relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 flex items-center justify-center shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 relative z-10">
                  <span className="material-symbols-outlined text-brand-blue group-hover:text-white">
                    {c.icon}
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-extrabold font-display mb-1">{c.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{c.body}</p>
                </div>
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
