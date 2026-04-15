import { cookies }     from 'next/headers'
import { jwtVerify }   from 'jose'
import { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production'
)

export interface SessionUser {
  userId:      string
  email:       string
  name:        string
  role:        'OPERATOR' | 'SUPER_USER' | 'SUB_USER'
  affiliateId: string | null
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('icx_session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionUser
  } catch { return null }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionUser | null> {
  try {
    const token = req.cookies.get('icx_session')?.value
    if (!token) return null
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionUser
  } catch { return null }
}

export function isSuperUser(s: SessionUser | null) {
  return s?.role === 'SUPER_USER' || s?.role === 'OPERATOR'
}

export function transactionScopeFilter(s: SessionUser) {
  if (s.role === 'OPERATOR')   return {}
  if (s.role === 'SUPER_USER') return { affiliateId: s.affiliateId }
  return { userId: s.userId }
}

export async function requireSession() {
  const session = await getSession()
  if (!session) return {
    session: null,
    error: Response.json({ error: 'Unauthorised. Please log in.' }, { status: 401 })
  }
  return { session, error: null }
}

export async function requireSuperUser() {
  const { session, error } = await requireSession()
  if (error || !session) return { session: null, error }
  if (!isSuperUser(session)) return {
    session: null,
    error: Response.json({ error: 'Forbidden. Super user access required.' }, { status: 403 })
  }
  return { session, error: null }
}

// ── Legacy exports — required by existing login route and middleware ──────

export function sessionSecretKey(): Uint8Array {
  const s = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production'
  return new TextEncoder().encode(s)
}

export async function signPortalJwt(email: string, role: string): Promise<string> {
  const { SignJWT } = await import('jose')
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(sessionSecretKey())
}

export async function verifyPortalJwt(token: string) {
  const { jwtVerify } = await import('jose')
  const { payload } = await jwtVerify(token, sessionSecretKey())
  return payload
}
