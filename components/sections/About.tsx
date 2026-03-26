"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const bars = [
  { label: "2019", h: "h-[40%]", v: 42 },
  { label: "2021", h: "h-[55%]", v: 55 },
  { label: "2023", h: "h-[72%]", v: 72 },
  { label: "2025", h: "h-[88%]", v: 88 },
];

export default function About() {
  return (
    <section
      id="about"
      className="section-spacing relative px-6 max-w-7xl mx-auto scroll-mt-24 overflow-hidden"
    >
      <div className="absolute top-10 right-[-5%] text-[14vw] md:text-[16vw] font-black text-slate-900/[0.02] select-none whitespace-nowrap pointer-events-none">
        ABOUT
      </div>
      <InView>
        <SectionLabel text="Market Context" />
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] font-display text-slate-900 mb-10">
          The UAE health insurance market is{" "}
          <GradientText>scaling fast</GradientText>.
        </h2>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-slate-600 font-body text-lg leading-relaxed mb-8">
              Employers, brokers, and typing centres need one place to compare
              plans, price accurately, and issue policies without juggling
              fragmented insurer portals.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 md:p-8">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6">
                Digital issuance index (illustrative)
              </p>
              <div className="flex items-end justify-between gap-3 h-48 border-b border-slate-200 pb-2">
                {bars.map((b) => (
                  <div key={b.label} className="flex flex-col items-center flex-1 gap-2">
                    <div className="w-full flex justify-center items-end h-36">
                      <div
                        className={`w-[42%] max-w-12 rounded-t-lg bg-gradient-to-t from-brand-blue to-primary ${b.h}`}
                        title={`${b.v}%`}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <blockquote className="rounded-2xl border border-brand-blue/20 bg-brand-blue/[0.06] p-8 md:p-10 italic text-lg md:text-xl text-brand-blue font-medium leading-relaxed">
              &ldquo;Distribution wins when operational discipline meets digital
              speed — brokers and typing centres deserve the same tools as
              global insurers.&rdquo;
            </blockquote>
          </div>
        </div>
      </InView>
    </section>
  );
}
