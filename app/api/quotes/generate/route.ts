import { NextResponse } from "next/server";
import { z } from "zod";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";
import { getPrisma } from "@/lib/db/prisma";

const input = z.object({
  age: z.number().int().min(0).max(120),
  gender: z.enum(["M", "F"]),
  nationality: z.string().min(2).max(80),
  visa_category: z.string().min(1),
  emirate: z.string().min(1),
  salary_band: z.string().min(1),
  spouse_count: z.number().int().min(0).max(8).optional().default(0),
  child_count: z.number().int().min(0).max(20).optional().default(0),
});

function mockPlans(age: number, emirate: string) {
  const base = 1800 + Math.max(0, age - 18) * 35;
  return [
    {
      plan_id: "plan-essential",
      insurer: "Insurer A",
      name: "Essential Network",
      annual_premium_aed: Math.round(base * 0.95),
      highlights: ["OPD", "IPD", "Emergency"],
      network: "Standard",
    },
    {
      plan_id: "plan-premier",
      insurer: "Insurer B",
      name: "Premier Care",
      annual_premium_aed: Math.round(base * 1.12),
      highlights: ["OPD", "IPD", "Dental", "Maternity"],
      network: "Premier",
      badge: "best_value",
    },
    {
      plan_id: "plan-elite",
      insurer: "Insurer C",
      name: "Elite Plus",
      annual_premium_aed: Math.round(base * 1.35),
      highlights: ["OPD", "IPD", "Dental", "Optical", "Pharmacy"],
      network: "Elite",
      badge: "most_comprehensive",
    },
  ].map((p) => ({ ...p, emirate_eligible: emirate }));
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json" } }, { status: 400 });
  }
  const parsed = input.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 400 });
  }
  const params = parsed.data;
  const plans = mockPlans(params.age, params.emirate);
  const generatedAt = new Date().toISOString();
  const body = {
    ok: true,
    generated_at: generatedAt,
    input: params,
    plans,
    disclaimer: "Mock quotation for development. Premiums are illustrative only.",
  };

  const prisma = getPrisma();
  if (prisma) {
    const session = await getPortalSessionFromRequest(request);
    let userId: string | undefined;
    if (session) {
      const u = await prisma.user.findUnique({ where: { email: session.email } });
      userId = u?.id;
    }
    await prisma.quoteRequest.create({
      data: {
        userId,
        input: params as object,
        output: { plans, generated_at: generatedAt, disclaimer: body.disclaimer } as object,
      },
    });
  }

  return NextResponse.json(body);
}
