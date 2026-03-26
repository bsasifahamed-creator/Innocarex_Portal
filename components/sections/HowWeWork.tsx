"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const governance = [
  { title: "Governed data", desc: "Structured member profiles with audit trails.", icon: "shield", bg: "bg-brand-blue" },
  { title: "Aligned partners", desc: "Insurer and TPA workflows in one rhythm.", icon: "handshake", bg: "bg-indigo-500" },
  { title: "Operational tempo", desc: "SLA-aware queues from quote to card.", icon: "groups", bg: "bg-brand-teal" },
  { title: "Configurable rules", desc: "Eligibility, bands, and plan matrices per tenant.", icon: "tune", bg: "bg-purple-500" },
];

const capabilities = [
  { title: "Discovery & comparison", icon: "search", body: "Multi-insurer quotes with plan feature matrices." },
  { title: "Issuance & enrollment", icon: "construction", body: "Policy drafts, approvals, and TPA handoff." },
  { title: "Automation layer", icon: "bolt", body: "Cards, renewals, and reconciliation hooks." },
];

const pathway = [
  { n: "01", title: "Assess & quote", desc: "Capture risk profile; return eligible plans in milliseconds.", icon: "search" },
  { n: "02", title: "Structure & validate", desc: "MRZ-validated IDs, sponsor data, and compliance checks.", icon: "construction" },
  { n: "03", title: "Approve & transmit", desc: "Two-step approvals with insurer and TPA notifications.", icon: "bolt" },
  { n: "04", title: "Activate & serve", desc: "Digital cards, renewals, and broker-ready reporting.", icon: "rocket_launch" },
];

export default function HowWeWork() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="how-we-work"
      className="section-spacing relative px-6 max-w-7xl mx-auto scroll-mt-24 overflow-hidden"
    >
      <div className="absolute top-10 right-[-5%] text-[16vw] font-black text-slate-900/[0.02] select-none whitespace-nowrap pointer-events-none">
        METHOD
      </div>
      <InView>
        <SectionLabel text="Our Approach" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-12">
          How We <GradientText>Work</GradientText>
        </h2>
      </InView>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {governance.map((c, i) => (
          <InView key={c.title} delay={i * 0.05}>
            <div className="relative glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 h-full">
              {i < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-0.5 bg-slate-200 z-20" />
              )}
              <div className={`w-12 h-12 rounded-xl ${c.bg} text-white flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined">{c.icon}</span>
              </div>
              <h3 className="text-xl font-extrabold font-display tracking-tight mb-2">{c.title}</h3>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{c.desc}</p>
            </div>
          </InView>
        ))}
      </div>

      <InView className="mb-14">
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-brand-blue/5 to-brand-teal/5 border border-brand-blue/10 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
            <span className="material-symbols-outlined">verified</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">Outcome</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fewer handoffs, faster issuance, and a single audit trail from quote to health card.
            </p>
          </div>
        </div>
      </InView>

      <InView className="mb-6">
        <h3 className="text-2xl md:text-3xl font-extrabold font-display mb-4">Capabilities</h3>
        <div className="space-y-3">
          {capabilities.map((item, i) => (
            <div
              key={item.title}
              className={`border rounded-2xl overflow-hidden ${
                open === i ? "border-brand-blue/30 bg-white" : "border-slate-200 bg-white/60 backdrop-blur-sm"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full flex items-center gap-4 p-4 text-left"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    open === i ? "bg-brand-blue/10 text-brand-blue" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <span className="font-bold text-slate-900 flex-1">{item.title}</span>
                <span className={`material-symbols-outlined transition-transform ${open === i ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 pl-[4.5rem] text-sm text-slate-600 leading-relaxed">{item.body}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </InView>

      <InView>
        <h3 className="text-2xl md:text-3xl font-extrabold font-display mb-10">Engagement pathway</h3>
      </InView>

      <div className="relative">
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-blue/20 via-brand-teal/20 to-transparent" />
        <div className="space-y-8">
          {pathway.map((step, i) => (
            <InView key={step.n} delay={i * 0.08}>
              <div className="hidden md:flex gap-8 items-start">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-brand-blue/20 flex items-center justify-center z-10 shrink-0 shadow-sm">
                  <span className="text-xl font-black text-brand-blue">{step.n}</span>
                </div>
                <div className="glass-card rounded-2xl p-7 flex-1 group hover:-translate-y-0.5 transition-transform duration-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 group-hover:bg-brand-blue flex items-center justify-center mb-4 transition-colors duration-500">
                    <span className="material-symbols-outlined text-brand-blue group-hover:text-white transition-colors">
                      {step.icon}
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold font-display mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              <div className="md:hidden glass-card rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand-blue text-sm">{step.icon}</span>
                  </div>
                  <span className="text-lg font-black text-brand-blue">{step.n}</span>
                  <h4 className="font-extrabold">{step.title}</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}
