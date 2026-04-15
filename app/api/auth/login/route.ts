import { cookies }         from "next/headers"
import { NextResponse }    from "next/server"
import { z }               from "zod"
import { verifyPassword }  from "@/lib/auth/password"
import { getPrisma }       from "@/lib/db/prisma"
import { signPortalJwt }   from "@/lib/session"

const bodySchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  let json: unknown
  try { json = await request.json() }
  catch { return NextResponse.json({ error: { code: "invalid_json" } }, { status: 400 }) }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 400 })
  }

  const email    = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password

  const prisma = getPrisma()

  if (prisma) {
    try {
      const user = await prisma.user.findUnique({ where: { email } })

      if (user) {
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
          return NextResponse.json(
            { error: { code: "account_locked", message: `Account locked. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` } },
            { status: 423 }
          )
        }
        // isActive check — allow if field is missing (new seeded users)
        const active = (user as any).isActive !== false
        if (active) {
          const passwordField = (user as any).passwordHash || (user as any).password || ''
          const valid = await verifyPassword(password, passwordField)
          if (valid) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: 0,
                lockedUntil:      null,
                lastLoginAt:      new Date(),
              },
            })
            const token = await signPortalJwt(user.email, (user as any).role ?? 'SUB_USER')
            const jar = await cookies()
            jar.set("icx_session", token, {
              httpOnly: true,
              secure:   process.env.NODE_ENV === "production",
              sameSite: "lax",
              path:     "/",
              maxAge:   60 * 30,
            })
            return NextResponse.json({ ok: true, mode: "database" })
          }
          if (!valid) {
            const count = (user.failedLoginCount ?? 0) + 1
            const lock  = count >= 5
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginCount: count,
                lockedUntil: lock ? new Date(Date.now() + 30 * 60 * 1000) : null,
              },
            })
            if (lock) {
              return NextResponse.json(
                { error: { code: "account_locked", message: "Account locked for 30 minutes after 5 failed attempts." } },
                { status: 423 }
              )
            }
            return NextResponse.json(
              { error: { code: "invalid_credentials", message: `Invalid credentials. ${5 - count} attempt${5 - count === 1 ? '' : 's'} remaining.` } },
              { status: 401 }
            )
          }
        }
      }
    } catch (e) {
      console.error("[login] DB error:", e)
    }

    return NextResponse.json({ error: { code: "invalid_credentials" } }, { status: 401 })
  }

  // No DB — demo fallback
  const okEmail = (process.env.DEMO_PORTAL_EMAIL || "demo@innocarex.ae").trim().toLowerCase()
  const okPass  = process.env.DEMO_PORTAL_PASSWORD || "innocarex-demo"

  if (email !== okEmail || password !== okPass) {
    return NextResponse.json({ error: { code: "invalid_credentials" } }, { status: 401 })
  }

  const token = await signPortalJwt(email, "SUB_USER")
  const jar   = await cookies()
  jar.set("icx_session", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 30,
  })
  return NextResponse.json({ ok: true, mode: "demo_no_database" })
}
