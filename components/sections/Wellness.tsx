"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const layers = [
  { layer: "Layer 01", title: "Care navigation", desc: "Guided pathways to in-network providers and programs.", icon: "apartment" },
  { layer: "Layer 02", title: "Partner ecosystem", desc: "Wellness vendors aligned to insurer-approved networks.", icon: "handshake" },
  { layer: "Layer 03", title: "Clinical touchpoints", desc: "Preventive screenings and chronic-care prompts.", icon: "medical_services" },
  { layer: "Layer 04", title: "Population view", desc: "Employer insights without exposing member-level PII.", icon: "groups" },
  { layer: "Layer 05", title: "Innovation lab", desc: "Sandbox for pilots with governance and audit trails.", icon: "biotech" },
];

export default function Wellness() {
  return (
    <section id="wellness" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24">
      <InView>
        <SectionLabel text="Ecosystem" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-4">
          Wellness{" "}
          <GradientText from="from-brand-teal" to="to-emerald-500">
            Intelligence
          </GradientText>
        </h2>
        <p className="text-slate-600 max-w-2xl mb-10">
          Layered programs that sit beside core insurance distribution — measurable, compliant, and broker-ready.
        </p>
      </InView>
      <div className="space-y-4">
        {layers.map((L, i) => (
          <InView key={L.layer} delay={i * 0.05}>
            <div className="glass-card rounded-2xl p-6 md:p-7 flex items-start gap-5 hover:-translate-y-0.5 transition-transform duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-teal/10 to-emerald-100/50 flex items-center justify-center text-brand-teal text-2xl group-hover:bg-brand-teal group-hover:text-white transition-all duration-500 shrink-0">
                <span className="material-symbols-outlined">{L.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-extrabold font-display tracking-tight mb-1">{L.title}</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{L.desc}</p>
              </div>
              <span className="text-[10px] font-black text-slate-200 tracking-[0.2em] uppercase shrink-0 hidden sm:block mt-1">
                {L.layer}
              </span>
            </div>
          </InView>
        ))}
      </div>
    </section>
  );
}
