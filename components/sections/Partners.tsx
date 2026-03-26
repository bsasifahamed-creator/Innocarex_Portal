"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const partners = [
  { icon: "psychology", name: "Clinical networks", desc: "Tiered provider access" },
  { icon: "diversity_2", name: "Broker alliances", desc: "Co-selling frameworks" },
  { icon: "leaderboard", name: "Insurer programs", desc: "Plan orchestration" },
  { icon: "handshake", name: "TPA rails", desc: "Enrollment automation" },
  { icon: "groups", name: "Corporate HR", desc: "Group lifecycle tools" },
];

function Chips() {
  return (
    <>
      {partners.map((p) => (
        <div
          key={p.name}
          className="glass-card px-8 py-6 rounded-2xl shrink-0 min-w-[280px] flex items-center gap-5 group"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue/10 to-brand-teal/10 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
            <span className="material-symbols-outlined text-brand-blue group-hover:text-white">
              {p.icon}
            </span>
          </div>
          <div className="min-w-0">
            <span className="text-base font-bold text-slate-900 block truncate">{p.name}</span>
            <span className="text-xs text-slate-400 font-medium">{p.desc}</span>
          </div>
        </div>
      ))}
    </>
  );
}

export default function Partners() {
  return (
    <section id="partners" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24 overflow-hidden">
      <InView>
        <SectionLabel text="Network" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-10">
          <GradientText from="from-brand-blue" to="to-brand-teal" className="italic">
            Partner
          </GradientText>{" "}
          ecosystem
        </h2>
      </InView>
      <div className="relative mask-linear-fade overflow-hidden py-4">
        <motion.div
          className="flex gap-6 w-max"
          animate={{ x: [0, -1400] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          <div className="flex gap-6">
            <Chips />
          </div>
          <div className="flex gap-6" aria-hidden>
            <Chips />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
