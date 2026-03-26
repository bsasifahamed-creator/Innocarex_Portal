import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { getPrisma } from "@/lib/db/prisma";
import { signPortalJwt } from "@/lib/session";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
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
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const okEmail = (process.env.DEMO_PORTAL_EMAIL || "demo@innocarex.ae").trim().toLowerCase();
  const okPass = process.env.DEMO_PORTAL_PASSWORD || "innocarex-demo";

  const prisma = getPrisma();
  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user?.isActive) {
        const valid = await verifyPassword(password, user.passwordHash);
        if (valid) {
          const token = await signPortalJwt(user.email, user.role);
          const jar = await cookies();
          jar.set("icx_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });
          return NextResponse.json({ ok: true, mode: "database" });
        }
      }
    } catch {
      // If the DB is misconfigured/unreachable, we allow a demo-credential fallback.
    }

    // Demo fallback (only for the configured demo user).
    if (email === okEmail && password === okPass) {
      const token = await signPortalJwt(parsed.data.email.trim(), "BROKER");
      const jar = await cookies();
      jar.set("icx_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json({ ok: true, mode: "database_fallback_demo" });
    }

    return NextResponse.json({ error: { code: "invalid_credentials" } }, { status: 401 });
  }

  if (email !== okEmail || password !== okPass) {
    return NextResponse.json({ error: { code: "invalid_credentials" } }, { status: 401 });
  }
  const token = await signPortalJwt(parsed.data.email.trim(), "BROKER");
  const jar = await cookies();
  jar.set("icx_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ ok: true, mode: "demo_no_database" });
}
