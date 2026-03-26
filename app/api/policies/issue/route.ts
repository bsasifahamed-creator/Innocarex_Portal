import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";
import { getPrisma } from "@/lib/db/prisma";
import { buildCertificatePdf, buildEcardPdf } from "@/lib/policies/issuePdfs";

export const runtime = "nodejs";

const bodySchema = z.object({
  member_name_en: z.string().min(2),
  member_name_ar: z.string().optional(),
  emirates_id_number: z.string().optional(),
  plan_id: z.string().min(1),
  plan_name: z.string().min(1),
  insurer: z.string().min(1),
  annual_premium_aed: z.number().nonnegative(),
  network: z.string().optional(),
  tpa: z.string().optional(),
});

function generatePolicyNumber(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.floor(Math.random() * 900 + 100);
  return `ICX-${t}-${r}`;
}

export async function POST(request: Request) {
  const prisma = getPrisma();
  const session = await getPortalSessionFromRequest(request);
  if (prisma && !session) {
    return NextResponse.json(
      {
        error: {
          code: "unauthorized",
          message: "Sign in required to issue policies when DATABASE_URL is configured.",
        },
      },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json" } }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 400 });
  }
  const b = parsed.data;
  const now = new Date();
  const effective = now.toISOString().slice(0, 10);
  const exp = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const expiry = exp.toISOString().slice(0, 10);

  const input = {
    policyNumber: generatePolicyNumber(),
    memberNameEn: b.member_name_en,
    memberNameAr: b.member_name_ar,
    emiratesId: b.emirates_id_number,
    insurer: b.insurer,
    planName: b.plan_name,
    tpa: b.tpa || "Demo TPA",
    network: b.network || "National network",
    effectiveDate: effective,
    expiryDate: expiry,
    emergencyPhone: process.env.DEMO_EMERGENCY_PHONE || "+971-4-000-0000",
    annualPremiumAed: b.annual_premium_aed,
  };

  const ecardBytes = await buildEcardPdf(input);
  const certBytes = await buildCertificatePdf(input);

  let userId: string | null = null;
  if (prisma && session) {
    const u = await prisma.user.findUnique({ where: { email: session.email } });
    userId = u?.id ?? null;
  }

  if (prisma) {
    const dir = path.join(process.cwd(), "data", "policies", input.policyNumber);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "ecard.pdf"), ecardBytes);
    await writeFile(path.join(dir, "certificate.pdf"), certBytes);
    const ecardRel = path.posix.join("data", "policies", input.policyNumber, "ecard.pdf");
    const certRel = path.posix.join("data", "policies", input.policyNumber, "certificate.pdf");

    await prisma.policy.create({
      data: {
        policyNumber: input.policyNumber,
        userId: userId ?? undefined,
        memberNameEn: input.memberNameEn,
        memberNameAr: input.memberNameAr,
        emiratesId: input.emiratesId,
        planId: b.plan_id,
        planName: input.planName,
        insurer: input.insurer,
        annualPremium: String(b.annual_premium_aed),
        network: input.network,
        tpa: input.tpa,
        ecardPath: ecardRel,
        certPath: certRel,
        effectiveDate: new Date(effective),
        expiryDate: new Date(expiry),
        summary: {
          plan_id: b.plan_id,
          premium_aed: b.annual_premium_aed,
        },
      },
    });

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "POLICY_ISSUED",
          entityType: "Policy",
          entityId: input.policyNumber,
          metadata: { insurer: input.insurer, plan_id: b.plan_id },
        },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    policy_number: input.policyNumber,
    plan_id: b.plan_id,
    issued_at: now.toISOString(),
    effective_date: effective,
    expiry_date: expiry,
    persisted: Boolean(prisma),
    summary: {
      member_name_en: input.memberNameEn,
      emirates_id: input.emiratesId || null,
      insurer: input.insurer,
      plan: input.planName,
      premium_aed: input.annualPremiumAed,
    },
    ecard_pdf_base64: Buffer.from(ecardBytes).toString("base64"),
    certificate_pdf_base64: Buffer.from(certBytes).toString("base64"),
    filenames: {
      ecard: `innocarex-ecard-${input.policyNumber}.pdf`,
      certificate: `innocarex-certificate-${input.policyNumber}.pdf`,
    },
  });
}
