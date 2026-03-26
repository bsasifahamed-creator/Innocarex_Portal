import { SignJWT, jwtVerify } from "jose";

export function sessionSecretKey(): Uint8Array {
  const s = process.env.SESSION_SECRET || "development-only-change-me-32chars-min";
  return new TextEncoder().encode(s);
}

export async function signPortalJwt(email: string, role: string = "BROKER"): Promise<string> {
  return new SignJWT({ sub: email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecretKey());
}

export async function verifyPortalJwt(token: string) {
  const { payload } = await jwtVerify(token, sessionSecretKey());
  return payload;
}
