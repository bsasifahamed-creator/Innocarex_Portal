import { verifyPortalJwt } from "@/lib/session";

export type PortalSession = {
  email: string;
  role: string;
};

export async function getPortalSessionFromRequest(request: Request): Promise<PortalSession | null> {
  const raw = request.headers.get("cookie") || "";
  const m = raw.match(/(?:^|; )icx_session=([^;]*)/);
  const token = m?.[1] ? decodeURIComponent(m[1]) : null;
  if (!token) return null;
  try {
    const payload = await verifyPortalJwt(token);
    const email = String(payload.sub || "").trim().toLowerCase();
    const role = String(payload.role || "BROKER");
    if (!email) return null;
    return { email, role };
  } catch {
    return null;
  }
}
