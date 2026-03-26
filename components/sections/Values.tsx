"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const cards = [
  {
    title: "Passion",
    desc: "We show up for brokers and typing centres with the same urgency as peak season at the counter.",
    icon: "engineering",
    grad: "from-blue-500 to-sky-400",
  },
  {
    title: "Purpose",
    desc: "Every workflow maps to compliant issuance — auditable, explainable, and fast.",
    icon: "trending_up",
    grad: "from-teal-500 to-emerald-400",
  },
  {
    title: "Performance",
    desc: "Sub-second quotes, predictable SLAs, and integrations that fail gracefully.",
    icon: "update",
    grad: "from-purple-500 to-indigo-400",
  },
];

export default function Values() {
  return (
    <section id="values" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24">
      <div className="lg:flex lg:flex-row lg:items-start gap-12 lg:gap-16">
        <InView className="lg:w-2/5 mb-10 lg:mb-0">
          <SectionLabel text="Principles" />
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display">
            <span className="block text-slate-900">Passion.</span>
            <span className="block ml-6 md:ml-10 mt-2">
              <GradientText>Purpose.</GradientText>
            </span>
            <span className="block ml-12 md:ml-20 mt-2">
              <GradientText from="from-brand-teal" to="to-green-400">
                Performance.
              </GradientText>
            </span>
          </h2>
        </InView>
        <div className="lg:w-3/5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <InView key={c.title} delay={i * 0.07}>
              <div className="glass-card rounded-2xl p-6 md:p-7 h-full group hover:-translate-y-0.5 transition-transform">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="material-symbols-outlined">{c.icon}</span>
                </div>
                <h3 className="text-xl font-extrabold font-display tracking-tight mb-2">{c.title}</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{c.desc}</p>
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
