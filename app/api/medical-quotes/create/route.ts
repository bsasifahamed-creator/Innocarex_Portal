import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

type PaymentDoc = { type: string; filename: string };

const planCatalog = [
  { plan_id: "plan1", label: "Plan 1", basePremium: 2500 },
  { plan_id: "plan2", label: "Plan 2", basePremium: 3000 },
  { plan_id: "plan3", label: "Plan 3", basePremium: 3800 },
] as const;

const policyTypeEnum = z.enum(["Individuals/Family", "Domestic Worker", "Company"]);
const genderEnum = z.enum(["Male", "Female"]);
const maritalEnum = z.enum(["Married", "Single"]);
const memberCategoryEnum = z.enum(["New to Country", "Existing in UAE", "New Born Inside UAE", "UAE & GCC Nationals"]);
const visaCityEnum = z.enum(["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm al Quwain"]);

function normalizeEmiratesId(value?: string) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 15);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 14) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14, 15)}`;
}

const bodySchema = z
  .object({
    plan_id: z.enum(["plan1", "plan2", "plan3"]),
    policy_type: policyTypeEnum,
    sponsor_name: z.string().min(2),
    sponsor_email: z.string().email().optional().or(z.literal("")).optional(),
    sponsor_mobile: z.string().regex(/^05\d{8}$/, "Mobile must start with 05 and be 10 digits total"),

    sponsor_emirates_id: z.string().optional(),
    trade_license_no: z.string().optional(),

    first_name: z.string().min(2),
    middle_name: z.string().optional().or(z.literal("")).optional(),
    last_name: z.string().min(2),
    date_of_birth: z.string().min(1),
    gender: genderEnum,
    marital_status: maritalEnum,
    height_cm: z.number().min(1).max(250).optional(),
    weight_kg: z.number().min(1).max(400).optional(),

    relation_with_sponsor: z.string().optional().or(z.literal("")).optional(),
    member_category: memberCategoryEnum,
    unified_number: z.string().optional().or(z.literal("")).optional(),
    birth_certificate_no: z.string().optional().or(z.literal("")).optional(),
    member_emirates_id: z.string().optional().or(z.literal("")).optional(),
    nationality: z.string().min(2),
    residency_visa_city: visaCityEnum,
    visa_file_no: z.string().min(2),
    occupation: z.string().optional().or(z.literal("")).optional(),
    salary_category: z.string().optional().or(z.literal("")).optional(),
    declaration_confirmed: z.literal(true),
  })
  .superRefine((v, ctx) => {
    // Sponsor section conditional
    const emiratesPattern = /^784-\d{4}-\d{7}-\d$/;
    if (v.policy_type === "Individuals/Family" || v.policy_type === "Domestic Worker") {
      if (!v.sponsor_emirates_id) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sponsor_emirates_id"], message: "Emirates ID is required." });
      else if (!emiratesPattern.test(normalizeEmiratesId(v.sponsor_emirates_id)))
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sponsor_emirates_id"], message: "Emirates ID must match 784-xxxx-xxxxxxx-x." });
    }
    if (v.policy_type === "Company") {
      if (!v.trade_license_no || v.trade_license_no.trim().length < 3) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["trade_license_no"], message: "Trade licence number is required for Company." });
    }

    // Member category conditional
    if (v.member_category === "New to Country" || v.member_category === "Existing in UAE") {
      if (!v.unified_number || v.unified_number.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unified_number"], message: "Unified Number is required for this member category." });
      }
    }
    if (v.member_category === "New Born Inside UAE") {
      if (!v.birth_certificate_no || v.birth_certificate_no.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["birth_certificate_no"], message: "Birth Certificate No. is required for New Born Inside UAE." });
      }
    }
    if (v.member_category === "Existing in UAE" || v.member_category === "UAE & GCC Nationals") {
      if (!v.member_emirates_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["member_emirates_id"], message: "Emirates ID is required for this member category." });
      } else if (!emiratesPattern.test(normalizeEmiratesId(v.member_emirates_id))) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["member_emirates_id"], message: "Emirates ID must match 784-xxxx-xxxxxxx-x." });
      }
    }

    // Visa file prefix rules
    const prefixMap: Record<z.infer<typeof visaCityEnum>, string> = {
      "Abu Dhabi": "101/",
      Dubai: "201/",
      Ajman: "401/",
      Fujairah: "701/",
      "Ras Al Khaimah": "601/",
      Sharjah: "301/",
      "Umm al Quwain": "501/",
    };
    const expected = prefixMap[v.residency_visa_city];
    const visaBaseRegex = /^\d{3}\/\d{4}\/\d\/\d{7}$/;
    if (!v.visa_file_no.startsWith(expected)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visa_file_no"], message: `Visa File No must start with ${expected}` });
    }
    if (!visaBaseRegex.test(v.visa_file_no)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visa_file_no"], message: "Visa File No must match xxx/xxxx/x/xxxxxxx" });
    }

    // DOB cannot be in the future.
    const today = new Date();
    const todayStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
      .toISOString()
      .slice(0, 10);
    if (v.date_of_birth > todayStr) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date_of_birth"], message: "Future date is not allowed for Date of Birth." });
    }
  });

function generateQuoteId() {
  const t = Date.now().toString(36).toUpperCase();
  return `MQ-${t}`;
}

function computePremium(plan_id: string) {
  const plan = planCatalog.find((p) => p.plan_id === plan_id) ?? planCatalog[0];
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

async function generateQuotePdfBytes(params: { quoteId: string; payload: unknown; premium: ReturnType<typeof computePremium> }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Medical Insurance Quotation", { x: 48, y: 780, size: 18, font: bold, color: rgb(0.05, 0.1, 0.2) });
  page.drawText(`Quote ID: ${params.quoteId}`, { x: 48, y: 754, size: 11, font, color: rgb(0.2, 0.3, 0.4) });

  const premLines = [
    ["Basic Premium", `${params.premium.basic_premium.toFixed(2)} AED`],
    ["ICP fees", `${params.premium.icp_fees.toFixed(2)} AED`],
    ["Net Premium", `${params.premium.net_premium.toFixed(2)} AED`],
    ["VAT (5%) on net", `${params.premium.vat_on_net_premium.toFixed(2)} AED`],
    ["Total Premium (1 year)", `${params.premium.total_premium.toFixed(2)} AED`],
  ];

  let y = 710;
  for (const [k, val] of premLines) {
    page.drawText(k, { x: 48, y, size: 10, font: bold, color: rgb(0.15, 0.2, 0.3) });
    page.drawText(val, { x: 260, y, size: 10, font, color: rgb(0.1, 0.12, 0.18) });
    y -= 22;
  }

  page.drawText("This is a demo quotation document for portal testing.", { x: 48, y: 120, size: 9, font, color: rgb(0.4, 0.42, 0.45) });
  return pdf.save();
}

export async function POST(request: Request) {
  const session = await getPortalSessionFromRequest(request);
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json" } }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation", details: parsed.error.flatten() } }, { status: 400 });
  }

  const payload = parsed.data;
  const premium = computePremium(payload.plan_id);
  const quoteId = generateQuoteId();
  const paymentLink = `https://pay.innocarex.ae/mock/${quoteId}`;

  const status = "DRAFT_SAVED";
  const dir = path.join(process.cwd(), "data", "medical-quotes", quoteId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "draft.json"), JSON.stringify({ status, session, payload, premium, createdAt: new Date().toISOString(), paymentLink }, null, 2), "utf8");

  // Optional DB persistence when DB is configured.
  const prisma = getPrisma();
  if (prisma) {
    let userId: string | undefined;
    if (session) {
      const u = await prisma.user.findUnique({ where: { email: session.email } });
      userId = u?.id;
    }
    await prisma.quoteRequest.create({
      data: {
        userId,
        input: payload as object,
        output: { quoteId, premium, status, paymentLink, createdAt: new Date().toISOString() } as object,
      },
    });
  }

  // Pre-generate quotation PDF so the download step is instant after payment in demo mode.
  const quotationPdf = await generateQuotePdfBytes({ quoteId, payload, premium });
  await writeFile(path.join(dir, "quotation.pdf"), quotationPdf);

  return NextResponse.json({
    ok: true,
    quoteId,
    status,
    paymentLink,
    premium,
  });
}

