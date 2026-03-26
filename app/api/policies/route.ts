import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }

  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json({
      ok: true,
      persistence: false,
      policies: [],
      message: "DATABASE_URL not set; policies are not persisted.",
    });
  }

  const user = await prisma.user.findUnique({ where: { email: session.email } });
  if (!user) {
    return NextResponse.json({ ok: true, persistence: true, policies: [] });
  }

  const isAdmin = session.role === "ADMIN";
  const rows = await prisma.policy.findMany({
    where: isAdmin ? undefined : { userId: user.id },
    orderBy: { issuedAt: "desc" },
    take: 100,
    select: {
      id: true,
      policyNumber: true,
      status: true,
      memberNameEn: true,
      insurer: true,
      planName: true,
      annualPremium: true,
      issuedAt: true,
      effectiveDate: true,
      expiryDate: true,
    },
  });

  return NextResponse.json({
    ok: true,
    persistence: true,
    policies: rows.map((r) => ({
      id: r.id,
      policy_number: r.policyNumber,
      status: r.status,
      member_name_en: r.memberNameEn,
      insurer: r.insurer,
      plan_name: r.planName,
      annual_premium_aed: Number(r.annualPremium),
      issued_at: r.issuedAt.toISOString(),
      effective_date: r.effectiveDate.toISOString().slice(0, 10),
      expiry_date: r.expiryDate.toISOString().slice(0, 10),
    })),
  });
}
