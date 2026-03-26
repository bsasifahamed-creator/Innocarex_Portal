import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  }
  return NextResponse.json({ ok: true, email: session.email, role: session.role });
}

