"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import InView from "@/components/ui/InView";

const faqs = [
  {
    q: "Who is InnoCare X built for?",
    a: "Brokers, typing centres, corporate HR teams, and internal operations staff who need unified multi-insurer workflows.",
  },
  {
    q: "How fast can we issue a policy?",
    a: "Target flow is under five minutes for member-ready data when documents validate on first upload.",
  },
  {
    q: "Do you replace insurer portals?",
    a: "We orchestrate comparison and issuance while respecting each insurer’s API or file-based interfaces.",
  },
  {
    q: "Where is data hosted?",
    a: "Architected for UAE-region residency with encryption in transit and at rest, aligned to PDPL expectations.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-spacing px-6 max-w-3xl mx-auto scroll-mt-24">
      <InView>
        <SectionLabel text="FAQ" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-10">
          Questions
        </h2>
      </InView>
      <div>
        {faqs.map((item, i) => (
          <InView key={item.q} delay={i * 0.05}>
            <div className="border-b border-slate-200/80">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex justify-between items-center py-6 w-full text-left gap-4"
              >
                <div className="flex items-start gap-4">
                  <span className="text-sm font-extrabold text-brand-teal shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-base md:text-lg font-bold text-slate-900">{item.q}</span>
                </div>
                <span
                  className={`material-symbols-outlined shrink-0 transition-transform duration-300 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  add
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-slate-500 leading-relaxed text-sm md:text-base pl-10 md:pl-12">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </InView>
        ))}
      </div>
    </section>
  );
}
