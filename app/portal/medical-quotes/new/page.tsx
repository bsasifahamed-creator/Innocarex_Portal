"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

// Full country list (ISO 3166) for nationality dropdown.
countries.registerLocale(en);

const planOptions = [
  { plan_id: "plan1", label: "Plan 1", basePremium: 2500 },
  { plan_id: "plan2", label: "Plan 2", basePremium: 3000 },
  { plan_id: "plan3", label: "Plan 3", basePremium: 3800 },
] as const;

const policyTypeOptions = ["Individuals/Family", "Domestic Worker", "Company"] as const;
const genderOptions = ["Male", "Female"] as const;
const maritalOptions = ["Married", "Single"] as const;
const memberCategoryOptions = ["New to Country", "Existing in UAE", "New Born Inside UAE", "UAE & GCC Nationals"] as const;
const residencyCities = ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm al Quwain"] as const;

const sponsorRelations = ["Brother", "Child", "Father", "Mother", "Other", "Self", "Sister", "Spouse"] as const;

type Step = "product" | "sponsor" | "member" | "payment" | "view";

type QuotePremium = {
  plan_id: string;
  basic_premium: number;
  icp_fees: number;
  vat_percentage: number;
  vat_on_net_premium: number;
  duration_years: number;
  total_premium: number;
  net_premium: number;
};

type QuoteCreateResponse = {
  ok: boolean;
  quoteId: string;
  status: string;
  paymentLink: string;
  premium: QuotePremium;
};

type QuotePaidResponse = {
  ok: boolean;
  quoteId: string;
  status: string;
  documents: Array<{ type: string; filename: string; base64: string }>;
};

function downloadBase64Pdf(b64: string, filename: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function computePremium(planId: string): QuotePremium {
  const plan = planOptions.find((p) => p.plan_id === planId) ?? planOptions[0];
  const basicPremium = plan.basePremium;
  const icpFees = 25.20;
  const vatPct = 0.05;
  const netPremium = basicPremium + icpFees;
  const vatOnNetPremium = netPremium * vatPct;
  const totalPremium = netPremium + vatOnNetPremium;
  return {
    plan_id: plan.plan_id,
    basic_premium: Number(basicPremium.toFixed(2)),
    icp_fees: Number(icpFees.toFixed(2)),
    vat_percentage: 5,
    vat_on_net_premium: Number(vatOnNetPremium.toFixed(2)),
    duration_years: 1,
    total_premium: Number(totalPremium.toFixed(2)),
    net_premium: Number(netPremium.toFixed(2)),
  };
}

function visaPrefix(city: string) {
  switch (city) {
    case "Abu Dhabi":
      return "101/";
    case "Dubai":
      return "201/";
    case "Ajman":
      return "401/";
    case "Fujairah":
      return "701/";
    case "Umm al Quwain":
      return "501/";
    case "Sharjah":
      return "301/";
    case "Ras Al Khaimah":
      return "601/";
    default:
      return "";
  }
}

function normalizeVisaFileInput(raw: string, prefix: string): string {
  // Remove all whitespace first.
  const compact = raw.replace(/\s+/g, "");
  // If user pasted full visa file with prefix, strip prefix and keep suffix only.
  if (compact.startsWith(prefix)) return compact.slice(prefix.length);
  // If user pasted with any 3-digit prefix (e.g. copied from another city),
  // strip the first prefix so we can re-apply the current selected city prefix.
  if (/^\d{3}\//.test(compact)) return compact.replace(/^\d{3}\//, "");
  return compact;
}

const sponsorEmiratesPattern = /^784-\d{4}-\d{7}-\d$/;
const mobilePattern = /^05\d{8}$/;

function normalizeEmiratesId(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 14) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14, 15)}`;
}

export default function NewMedicalQuotesPage() {
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState<Step>("product");
  const [error, setError] = useState<string>("");

  const nationalityOptions = useMemo(() => {
    const names = countries.getNames("en", { select: "official" });
    return Object.values(names).sort((a, b) => a.localeCompare(b));
  }, []);

  // Product
  const [planId, setPlanId] = useState<(typeof planOptions)[number]["plan_id"]>("plan1");

  // Sponsor
  const [policyType, setPolicyType] = useState<(typeof policyTypeOptions)[number]>("Individuals/Family");
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorEmail, setSponsorEmail] = useState("");
  const [sponsorMobile, setSponsorMobile] = useState("");
  const [sponsorEmiratesId, setSponsorEmiratesId] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");

  // Member (personal)
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<(typeof genderOptions)[number]>("Male");
  const [maritalStatus, setMaritalStatus] = useState<(typeof maritalOptions)[number]>("Single");
  const [heightCm, setHeightCm] = useState<string>("");
  const [weightKg, setWeightKg] = useState<string>("");

  // Member (citizenship)
  const memberType = policyType === "Individuals/Family" ? "Dependent" : "Employee";
  const relationWithSponsor =
    policyType === "Individuals/Family"
      ? undefined
      : policyType === "Domestic Worker"
        ? "Domestic Worker"
        : "Employee";

  const [relationIndividuals, setRelationIndividuals] = useState<(typeof sponsorRelations)[number]>("Self");
  const [memberCategory, setMemberCategory] = useState<(typeof memberCategoryOptions)[number]>("Existing in UAE");
  const [unifiedNumber, setUnifiedNumber] = useState("");
  const [birthCertificateNo, setBirthCertificateNo] = useState("");
  const [memberEmiratesId, setMemberEmiratesId] = useState("");
  const [nationality, setNationality] = useState("United Arab Emirates");
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [residencyVisaCity, setResidencyVisaCity] = useState<(typeof residencyCities)[number]>("Dubai");
  const [visaFileNoSuffix, setVisaFileNoSuffix] = useState("");
  const occupationDefault = memberType === "Dependent" ? "Dependent" : "";
  const [occupation, setOccupation] = useState("");
  const [salaryCategory, setSalaryCategory] = useState("No Salary");

  // Derived “same as city”
  const workLocation = residencyVisaCity;
  const workSubRegion = residencyVisaCity;

  // Payment + quote
  const premiumPreview = useMemo(() => computePremium(planId), [planId]);
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [quoteId, setQuoteId] = useState<string>("");
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [premium, setPremium] = useState<QuotePremium | null>(null);
  const [documents, setDocuments] = useState<QuotePaidResponse["documents"]>([]);
  const [paymentStatus, setPaymentStatus] = useState<"CREATED" | "PAID" | "">("");
  const [loading, setLoading] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const dobInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Keep member fields consistent with policy type.
    if (memberType === "Dependent") {
      setOccupation(occupationDefault);
      setSalaryCategory("No Salary");
    } else {
      if (!occupation || occupation === "Dependent") setOccupation("");
      if (salaryCategory === "No Salary") setSalaryCategory("Above 4000 AED");
    }
    // Default relation selectors
    if (policyType === "Individuals/Family") setRelationIndividuals("Self");
  }, [policyType]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetToMain() {
    setCreating(false);
    setStep("product");
    setError("");
    setDeclarationConfirmed(false);
    setQuoteId("");
    setPaymentLink("");
    setPremium(null);
    setDocuments([]);
    setPaymentStatus("");
    setLoading(false);
  }

  function requireField(cond: boolean, msg: string) {
    if (!cond) {
      setError(msg);
      return false;
    }
    return true;
  }

  function validateProduct(): boolean {
    setError("");
    return requireField(!!planId, "Select a plan to continue.");
  }

  function validateSponsor(): boolean {
    setError("");
    if (!requireField(!!policyType, "Policy Type is required.")) return false;
    if (!requireField(sponsorName.trim().length >= 2, "Sponsor Name is required.")) return false;
    if (!requireField(mobilePattern.test(sponsorMobile.trim()), "Mobile must start with 05 and be 10 digits.")) return false;

    if (policyType === "Individuals/Family" || policyType === "Domestic Worker") {
      if (!requireField(sponsorEmiratesId.trim().length > 0, "Emirates ID is required.")) return false;
      if (!requireField(sponsorEmiratesPattern.test(normalizeEmiratesId(sponsorEmiratesId.trim())), "Emirates ID must match 784-xxxx-xxxxxxx-x.")) return false;
    }

    if (policyType === "Company") {
      if (!requireField(tradeLicenseNo.trim().length >= 3, "Trade License No is required for Company.")) return false;
    }

    return true;
  }

  function validateMember(): boolean {
    setError("");
    if (!requireField(firstName.trim().length >= 2, "First Name is required.")) return false;
    if (!requireField(lastName.trim().length >= 2, "Last Name is required.")) return false;
    if (!requireField(!!dob, "Date of Birth is required.")) return false;
    if (!requireField(dob <= todayStr, "Future date is not allowed for Date of Birth.")) return false;
    if (heightCm.trim().length > 0) {
      const h = Number(heightCm);
      if (!requireField(Number.isFinite(h) && h >= 1 && h <= 250, "Height must be between 1 and 250 cm.")) return false;
    }
    if (weightKg.trim().length > 0) {
      const w = Number(weightKg);
      if (!requireField(Number.isFinite(w) && w >= 1 && w <= 400, "Weight must be between 1 and 400 kg.")) return false;
    }

    if (policyType === "Individuals/Family") {
      if (!requireField(!!relationIndividuals, "Relation With Sponsor is required.")) return false;
    }

    if (memberCategory === "New to Country" || memberCategory === "Existing in UAE") {
      if (!requireField(unifiedNumber.trim().length >= 2, "Unified Number is required for this member category.")) return false;
    }
    if (memberCategory === "New Born Inside UAE") {
      if (!requireField(birthCertificateNo.trim().length >= 2, "Birth Certificate No is required.")) return false;
    }
    if (memberCategory === "Existing in UAE" || memberCategory === "UAE & GCC Nationals") {
      if (!requireField(memberEmiratesId.trim().length > 0, "Member Emirates ID is required.")) return false;
      if (!requireField(sponsorEmiratesPattern.test(normalizeEmiratesId(memberEmiratesId.trim())), "Member Emirates ID must match 784-xxxx-xxxxxxx-x.")) return false;
    }

    if (!requireField(!!nationality, "Nationality is required.")) return false;
    if (!requireField(!!residencyVisaCity, "Residency Visa City is required.")) return false;
    const prefix = visaPrefix(residencyVisaCity);
    const visaFileNo = `${prefix}${visaFileNoSuffix.trim()}`;
    const visaBaseRegex = /^\d{3}\/\d{4}\/\d\/\d{7}$/;
    if (!requireField(visaFileNo.trim().startsWith(prefix), `Visa File No must start with ${prefix}`)) return false;
    if (!requireField(visaBaseRegex.test(visaFileNo.trim()), `Visa File No must match xxx/xxxx/x/xxxxxxx`)) return false;

    if (memberType === "Employee") {
      if (!requireField(occupation.trim().length >= 2, "Occupation is required for employee member type.")) return false;
    }
    if (memberType === "Dependent") {
      if (!requireField(salaryCategory === "No Salary", "Salary must be No Salary for Dependent member type.")) return false;
    } else {
      if (!requireField(salaryCategory.trim().length > 0, "Salary category is required.")) return false;
    }

    return true;
  }

  function assembledPayload() {
    const relation_with_sponsor = policyType === "Individuals/Family" ? relationIndividuals : relationWithSponsor || "";
    const member_emirates_id = memberEmiratesId.trim() ? normalizeEmiratesId(memberEmiratesId.trim()) : undefined;
    const sponsor_emirates_id = sponsorEmiratesId.trim() ? normalizeEmiratesId(sponsorEmiratesId.trim()) : undefined;
    const sponsor_email = sponsorEmail.trim() || undefined;

    return {
      plan_id: planId,
      policy_type: policyType,
      sponsor_name: sponsorName.trim(),
      sponsor_email,
      sponsor_mobile: sponsorMobile.trim(),
      sponsor_emirates_id,
      trade_license_no: tradeLicenseNo.trim() || undefined,

      first_name: firstName.trim(),
      middle_name: middleName.trim() || undefined,
      last_name: lastName.trim(),
      date_of_birth: dob,
      gender,
      marital_status: maritalStatus,
      height_cm: heightCm.trim() ? Number(heightCm) : undefined,
      weight_kg: weightKg.trim() ? Number(weightKg) : undefined,

      relation_with_sponsor,
      member_category: memberCategory,
      unified_number: unifiedNumber.trim() || undefined,
      birth_certificate_no: birthCertificateNo.trim() || undefined,
      member_emirates_id,
      nationality,
      residency_visa_city: residencyVisaCity,
      visa_file_no: `${visaPrefix(residencyVisaCity)}${visaFileNoSuffix.trim()}`,
      occupation: memberType === "Dependent" ? occupationDefault : occupation.trim(),
      salary_category: salaryCategory,
      declaration_confirmed: declarationConfirmed,
    };
  }

  async function createDraft() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/medical-quotes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(assembledPayload()),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(j?.error?.message || "Could not create draft.");
        setLoading(false);
        return;
      }
      const res = j as QuoteCreateResponse;
      setQuoteId(res.quoteId);
      setPaymentLink(res.paymentLink);
      setPremium(res.premium);
      setPaymentStatus("CREATED");
      setLoading(false);
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  async function markPaid() {
    if (!quoteId) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/medical-quotes/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quoteId }),
      });
      const j = (await r.json()) as QuotePaidResponse;
      if (!r.ok || !j.ok) {
        setError("Payment confirmation failed.");
        setLoading(false);
        return;
      }
      setDocuments(j.documents);
      setPaymentStatus("PAID");
      setStep("view");
      setLoading(false);
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }

  async function copyPaymentLink() {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
    } catch {
      // Fallback: best-effort
      const ta = document.createElement("textarea");
      ta.value = paymentLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  function openDobCalendar() {
    const el = dobInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else el.focus();
  }

  const expectedPrefix = visaPrefix(residencyVisaCity);
  const filteredNationalities = useMemo(() => {
    const q = nationality.trim().toLowerCase();
    if (!q) return nationalityOptions.slice(0, 30);
    return nationalityOptions.filter((n) => n.toLowerCase().includes(q)).slice(0, 30);
  }, [nationality, nationalityOptions]);

  return (
    <div className="space-y-6">
      {!creating ? (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">New Quotations</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">Create a fresh medical quote draft.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setStep("product");
                setError("");
              }}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
            >
              Add quotation
            </button>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-10 text-center text-slate-600 dark:text-slate-300">
            No saved drafts yet. Click <span className="font-semibold text-slate-900 dark:text-white">Add quotation</span> to start.
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
                {step === "product"
                  ? "Product"
                  : step === "sponsor"
                    ? "Sponsor"
                    : step === "member"
                      ? "Member"
                      : step === "payment"
                        ? "Payment"
                        : "View Quote"}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">Follow the steps to create a quotation draft.</p>
            </div>
            <button type="button" onClick={resetToMain} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900">
              Back to Medical Quotes
            </button>
          </div>

          {error ? <p className="text-red-600 text-sm">{error}</p> : null}

          {/* Step: Product */}
          {step === "product" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur p-6">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Select a plan</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Choose plan1, plan2, or plan3.</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {planOptions.map((p) => (
                    <button
                      key={p.plan_id}
                      type="button"
                      onClick={() => setPlanId(p.plan_id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        planId === p.plan_id ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20" : "border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">{p.label}</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">AED {p.basePremium.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">Basic premium</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateProduct()) setStep("sponsor");
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {/* Step: Sponsor */}
          {step === "sponsor" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur p-6">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Sponsor details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Policy Type*</span>
                    <select value={policyType} onChange={(e) => setPolicyType(e.target.value as any)} className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30">
                      {policyTypeOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Sponsor Name*</span>
                    <input value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Enter sponsor name" />
                  </label>

                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Sponsor Email</span>
                    <input value={sponsorEmail} onChange={(e) => setSponsorEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Optional" />
                  </label>

                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Mobile*</span>
                    <input value={sponsorMobile} onChange={(e) => setSponsorMobile(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="05xxxxxxxx" inputMode="numeric" />
                  </label>

                  {(policyType === "Individuals/Family" || policyType === "Domestic Worker") ? (
                    <label className="text-sm sm:col-span-2">
                      <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Emirates ID*</span>
                      <input
                        value={sponsorEmiratesId}
                        onChange={(e) => setSponsorEmiratesId(normalizeEmiratesId(e.target.value))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2"
                        placeholder="784-xxxx-xxxxxxx-x"
                      />
                    </label>
                  ) : null}

                  {policyType === "Company" ? (
                    <label className="text-sm sm:col-span-2">
                      <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Trade License No*</span>
                      <input
                        value={tradeLicenseNo}
                        onChange={(e) => setTradeLicenseNo(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2"
                        placeholder="Enter trade license number"
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep("product")} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateSponsor()) setStep("member");
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {/* Step: Member */}
          {step === "member" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur p-6">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Member details</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3">Personal details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">First Name*</span>
                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="First name" />
                      </label>
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Middle Name</span>
                        <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Middle name (optional)" />
                      </label>
                      <label className="text-sm sm:col-span-2">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Last Name*</span>
                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Last name" />
                      </label>
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Date of Birth*</span>
                        <div className="flex gap-2">
                          <input
                            ref={dobInputRef}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            type="date"
                            max={todayStr}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2"
                          />
                          <button
                            type="button"
                            onClick={openDobCalendar}
                            className="px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900"
                            aria-label="Open date picker"
                            title="Open calendar"
                          >
                            <span className="material-symbols-outlined text-[16px] leading-none">calendar_month</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">Select from calendar. Future dates are blocked.</p>
                      </label>
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Gender</span>
                        <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30">
                          {genderOptions.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Marital Status</span>
                        <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value as any)} className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30">
                          {maritalOptions.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Height (cm)</span>
                        <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" min={1} placeholder="Optional" />
                      </label>

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Weight (kg)</span>
                        <input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" min={1} placeholder="Optional" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3">Citizenship details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {policyType === "Individuals/Family" ? (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Relation With Sponsor*</span>
                          <select value={relationIndividuals} onChange={(e) => setRelationIndividuals(e.target.value as any)} className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30">
                            {sponsorRelations.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Relation With Sponsor*</span>
                          <input value={policyType === "Domestic Worker" ? "Domestic Worker" : "Employee"} disabled className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 px-3 py-2 text-slate-500" />
                        </label>
                      )}

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Member Type</span>
                        <input value={memberType} disabled className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 px-3 py-2 text-slate-500" />
                      </label>

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Member Category*</span>
                        <select value={memberCategory} onChange={(e) => setMemberCategory(e.target.value as any)} className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30">
                          {memberCategoryOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      {(memberCategory === "New to Country" || memberCategory === "Existing in UAE") ? (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Unified Number*</span>
                          <input value={unifiedNumber} onChange={(e) => setUnifiedNumber(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Enter Unified Number" />
                        </label>
                      ) : null}

                      {memberCategory === "New Born Inside UAE" ? (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Birth Certificate No.*</span>
                          <input value={birthCertificateNo} onChange={(e) => setBirthCertificateNo(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Enter birth certificate number" />
                        </label>
                      ) : null}

                      {(memberCategory === "Existing in UAE" || memberCategory === "UAE & GCC Nationals") ? (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Emirates ID*</span>
                          <input value={memberEmiratesId} onChange={(e) => setMemberEmiratesId(normalizeEmiratesId(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="784-xxxx-xxxxxxx-x" />
                        </label>
                      ) : null}

                      <label className="text-sm relative">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Nationality*</span>
                        <input
                          value={nationality}
                          onChange={(e) => {
                            setNationality(e.target.value);
                            setIsNationalityOpen(true);
                          }}
                          onFocus={() => setIsNationalityOpen(true)}
                          onBlur={() => setTimeout(() => setIsNationalityOpen(false), 120)}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2"
                          placeholder="Search or type nationality"
                        />
                        {isNationalityOpen ? (
                          <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg max-h-52 overflow-auto">
                            {filteredNationalities.length === 0 ? (
                              <p className="px-3 py-2 text-xs text-slate-500 dark:text-slate-300">No matches found</p>
                            ) : (
                              filteredNationalities.map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onMouseDown={() => {
                                    setNationality(n);
                                    setIsNationalityOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  {n}
                                </button>
                              ))
                            )}
                          </div>
                        ) : null}
                      </label>

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Residency Visa City*</span>
                        <select value={residencyVisaCity} onChange={(e) => setResidencyVisaCity(e.target.value as any)} className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30">
                          {residencyCities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm sm:col-span-2">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Visa File No.*</span>
                        <div className="flex">
                          <input
                            value={expectedPrefix}
                            readOnly
                            className="w-20 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70 px-3 py-2 text-slate-700 dark:text-slate-200"
                          />
                          <input
                            value={visaFileNoSuffix}
                            onChange={(e) => setVisaFileNoSuffix(normalizeVisaFileInput(e.target.value, expectedPrefix))}
                            className="flex-1 rounded-r-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2"
                            placeholder="xxx/xxxx/x/xxxxxxx"
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">Must start with {expectedPrefix}</p>
                      </label>

                      {memberType === "Employee" ? (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Occupation*</span>
                          <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 px-3 py-2" placeholder="Enter occupation" />
                        </label>
                      ) : (
                        <label className="text-sm sm:col-span-2">
                          <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Occupation*</span>
                          <input value="Dependent" disabled className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 px-3 py-2 text-slate-500" />
                        </label>
                      )}

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Work Location</span>
                        <input value={workLocation} disabled className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 px-3 py-2 text-slate-500" />
                      </label>

                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Work Sub-Region</span>
                        <input value={workSubRegion} disabled className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 px-3 py-2 text-slate-500" />
                      </label>

                      <label className="text-sm sm:col-span-2">
                        <span className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Salary</span>
                        <select
                          value={salaryCategory}
                          disabled={memberType === "Dependent"}
                          onChange={(e) => setSalaryCategory(e.target.value)}
                          className="themed-select w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 px-3 py-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                        >
                          <option value="Above 4000 AED">Above 4000 AED</option>
                          <option value="Below or up to 4000 AED">Below or up to 4000 AED</option>
                          <option value="No Salary">No Salary</option>
                        </select>
                        {memberType === "Dependent" ? <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">Dependent member type defaults to No Salary.</p> : null}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep("sponsor")} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateMember()) setStep("payment");
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}

          {/* Step: Payment */}
          {step === "payment" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur p-6">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Payment</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Premium breakdown is calculated automatically from the selected plan.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/20 p-4">
                    <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">Premium</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-300">Basic Premium</span>
                        <span className="font-semibold text-slate-900 dark:text-white">AED {premiumPreview.basic_premium.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-300">ICP fees</span>
                        <span className="font-semibold text-slate-900 dark:text-white">AED {premiumPreview.icp_fees.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-300">VAT Percentage</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{premiumPreview.vat_percentage}%</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-300">VAT on Net Premium</span>
                        <span className="font-semibold text-slate-900 dark:text-white">AED {premiumPreview.vat_on_net_premium.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-600 dark:text-slate-300">Duration</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{premiumPreview.duration_years} year</span>
                      </div>
                      <div className="flex justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">Total Premium</span>
                        <span className="text-brand-blue dark:text-brand-blue font-extrabold">AED {premiumPreview.total_premium.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/20 p-4">
                    <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">Declaration</p>
                    <label className="flex items-start gap-3 text-sm">
                      <input type="checkbox" checked={declarationConfirmed} onChange={(e) => setDeclarationConfirmed(e.target.checked)} className="mt-1" />
                      <span className="text-slate-700 dark:text-slate-200 leading-relaxed">
                        I confirm that the information I have provided is true and complete to the best of my knowledge, and I haven’t left out
                        any important details.
                      </span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-3">
                      This declaration is the basis of the agreement. Demo portal saves your quote as a draft.
                    </p>
                  </div>
                </div>

                {paymentStatus === "" ? (
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!declarationConfirmed) {
                          setError("Please confirm the declaration to continue.");
                          return;
                        }
                        createDraft();
                      }}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors disabled:opacity-60"
                    >
                      {loading ? "Saving…" : "Confirm & Save Draft"}
                    </button>
                  </div>
                ) : null}

                {paymentStatus === "CREATED" ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/20 p-4 space-y-3">
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">Payment link is ready</p>
                    <div className="flex flex-col gap-2">
                      <code className="text-xs bg-slate-900/5 dark:bg-white/5 px-3 py-2 rounded break-all text-slate-700 dark:text-slate-200">
                        {paymentLink}
                      </code>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={copyPaymentLink} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900">
                          Share link
                        </button>
                        <button type="button" onClick={markPaid} disabled={loading} className="px-4 py-2 rounded-xl bg-brand-teal text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
                          Mark as paid (demo)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep("member")} className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900">
                  Back
                </button>
                {paymentStatus === "PAID" ? (
                  <button type="button" onClick={() => setStep("view")} className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors">
                    Next
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Step: View Quote */}
          {step === "view" ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-brand-teal uppercase tracking-widest mb-2">Quote</p>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Quote ID: {quoteId}</h2>
                    {premium ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                        Total Premium: <span className="font-semibold text-brand-blue dark:text-brand-blue">AED {premium.total_premium.toFixed(2)}</span>
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Payment status</p>
                    <p className="text-sm text-brand-teal font-extrabold">{paymentStatus === "PAID" ? "Paid" : "—"}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3">Download documents</h3>
                  {documents.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 p-10 text-center text-slate-600 dark:text-slate-300">
                      No documents available.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {documents.map((d) => (
                        <button
                          key={d.type}
                          type="button"
                          onClick={() => downloadBase64Pdf(d.base64, d.filename)}
                          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-brand-blue transition-colors"
                        >
                          {d.filename.replace(/\.pdf$/i, "")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={resetToMain} className="px-6 py-3 rounded-xl bg-brand-teal text-white text-sm font-semibold hover:opacity-90 transition-colors">
                  Back to Medical Quotes
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

