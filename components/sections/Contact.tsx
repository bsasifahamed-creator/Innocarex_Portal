"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SectionLabel from "@/components/ui/SectionLabel";
import GradientText from "@/components/ui/GradientText";
import InView from "@/components/ui/InView";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  company: z.string().min(2, "Company is required"),
  message: z.string().min(10, "Please add a short message"),
});

type ContactValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (vals: ContactValues) => {
    setStatus("sending");
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals),
      });
      if (!r.ok) {
        setStatus("err");
        return;
      }
      setStatus("ok");
      reset();
    } catch {
      setStatus("err");
    }
  };

  return (
    <section id="contact" className="section-spacing px-6 max-w-7xl mx-auto scroll-mt-24">
      <InView>
        <SectionLabel text="Contact" />
      </InView>
      <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/30 border border-white/50 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-teal-100/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="grid md:grid-cols-2 relative">
          <div className="p-8 md:p-14 bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden min-h-[320px]">
            <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-teal text-xs font-bold uppercase tracking-wide mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-glow-pulse" />
                Priority access
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight mb-4">
                Start{" "}
                <GradientText from="from-brand-blue" to="to-primary">
                  reclaiming control
                </GradientText>{" "}
                of margins and{" "}
                <GradientText from="from-brand-teal" to="to-primary">
                  profitability
                </GradientText>
                .
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Tell us about your brokerage or typing centre. We will route you to the right onboarding path.
              </p>
            </div>
            <div className="relative z-10 mt-10 flex items-center gap-3 text-sm text-slate-300">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg">mail</span>
              </div>
              <span>hello@innocarex.ae</span>
            </div>
          </div>
          <div className="p-8 md:p-14 bg-slate-50 flex flex-col justify-center relative z-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-xl pointer-events-none">
                  person
                </span>
                <input
                  {...register("name")}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-xl pointer-events-none">
                  mail
                </span>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Work email"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-xl pointer-events-none">
                  apartment
                </span>
                <input
                  {...register("company")}
                  placeholder="Company"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-brand-blue"
                />
                {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-slate-400 text-xl pointer-events-none">
                  chat
                </span>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-brand-blue resize-none"
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>
              {status === "ok" ? (
                <p className="text-sm font-medium text-brand-teal">Thanks — we have received your message.</p>
              ) : null}
              {status === "err" ? (
                <p className="text-sm text-red-600">Something went wrong. Please try again shortly.</p>
              ) : null}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-brand-blue transition-colors disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
