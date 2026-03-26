import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { sessionSecretKey } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("icx_session")?.value;
  if (!token) {
    const next = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
  }
  try {
    await jwtVerify(token, sessionSecretKey());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/portal/:path*"],
};
