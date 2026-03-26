"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

// Inline SVG components for comparison card
function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      className="w-4 h-4"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      className="w-4 h-4"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const traditionalItems = [
  { icon: "broken_image", label: "Fragmented Insurer Portals" },
  { icon: "trending_up", label: "Manual Premium Calculations" },
  { icon: "update", label: "Days to Issue a Policy" },
];

const innocareItems = [
  { icon: "hub", label: "Unified Multi-Insurer Platform" },
  { icon: "query_stats", label: "Instant Quote Comparison" },
  { icon: "insights", label: "Policy Issued in Minutes" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      
      {/* Ambient background blobs — fixed position, pointer-events-none */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-blue-100/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-teal-100/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-50/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero content */}
      <div className="text-center max-w-5xl mx-auto pt-32 md:pt-40 relative px-4 w-full">
        
        {/* Radial glow behind title */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[300px] bg-primary/5 blur-[40px] md:blur-[80px] rounded-full pointer-events-none" />

        {/* Tagline */}
        <motion.p
          {...fadeUp(0)}
          className="text-sm sm:text-base md:text-lg tracking-[0.15em] font-semibold text-slate-400 uppercase mb-6"
        >
          UAE Health Insurance Distribution
        </motion.p>

        {/* H1 — hero title */}
        <motion.div {...fadeUp(0.1)} className="mb-6 flex justify-center">
          <div className="relative w-[360px] sm:w-[640px] md:w-[920px] lg:w-[1080px] h-[84px] sm:h-[110px] md:h-[140px] lg:h-[160px]">
            <Image
              src="/Hero.png.png"
              alt="InnoCare X"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 360px, (max-width: 768px) 640px, (max-width: 1024px) 920px, 1080px"
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-700 mb-4 font-display"
        >
          Redefining Health Insurance Distribution
        </motion.p>

        {/* Body */}
        <motion.p
          {...fadeUp(0.3)}
          className="text-lg md:text-xl text-slate-600 font-body max-w-3xl mx-auto leading-relaxed px-4 mb-10"
        >
          A unified digital platform for brokers, typing centres, and corporate
          partners to compare, quote, and issue UAE health insurance policies —
          all in under 5 minutes.
        </motion.p>

        {/* CTA button */}
        <motion.div {...fadeUp(0.4)} className="mb-16">
          <Link
            href="#contact"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            Get Started
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform duration-300">
              arrow_forward
            </span>
          </Link>
        </motion.div>
      </div>

      {/* ── COMPARISON CARD ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative mx-auto w-full max-w-5xl px-4 pb-24"
        style={{ perspective: "1000px" }}
      >
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-10">
          
          {/* Card header */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
              Traditional
            </span>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">compare_arrows</span>
              VS
            </div>
            <span className="text-xs font-black tracking-[0.2em] text-brand-blue uppercase">
              InnoCare X
            </span>
          </div>

          {/* Two-column grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Traditional column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-6 md:p-8"
            >
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">
                The Old Way
              </p>
              <div className="space-y-4 mb-8">
                {traditionalItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-500">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              {/* Footer — 3 red X icons */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-red-50 border border-red-100 text-red-500 flex items-center justify-center">
                      <XIcon />
                    </div>
                    {i < 2 && <div className="w-4 h-0.5 bg-red-300/50" />}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* InnoCare X column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-blue-50/80 to-white p-6 md:p-8"
            >
              <p className="text-xs font-extrabold text-brand-blue uppercase tracking-wider mb-6">
                InnoCare X
              </p>
              <div className="space-y-4 mb-8">
                {innocareItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </motion.div>
                ))}
              </div>
              {/* Footer — 3 green check icons */}
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-green-50 border border-green-100 text-green-500 shadow-sm shadow-green-900/5 flex items-center justify-center">
                      <CheckIcon />
                    </div>
                    {i < 2 && <div className="w-4 h-0.5 bg-green-300/50" />}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}
