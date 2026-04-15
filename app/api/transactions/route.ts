import { NextRequest, NextResponse } from 'next/server'
import { getPrisma }                 from '@/lib/db/prisma'
import { requireSession } from '@/lib/session'
import { checkDuplicate, setDuplicateGuard }       from '@/lib/redis'

function generateRef(): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const rand = Math.random().toString(36).slice(2,6).toUpperCase()
  return `PX-TXN-${date}-${rand}`
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const body = await req.json()
  const { tierId, programmeBundle, kyc } = body

  if (!tierId || !kyc?.fullName || !kyc?.whatsapp || !kyc?.email || !kyc?.dateOfBirth || !kyc?.sponsorId) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Duplicate detection
  if (kyc.emiratesId) {
    const { isDuplicate, existingRef } = await checkDuplicate(kyc.emiratesId, tierId)
    if (isDuplicate) {
      return NextResponse.json({ error: 'Duplicate transaction detected.', isDuplicate: true, existingRef }, { status: 409 })
    }
  }

  const prisma = getPrisma()
  if (!prisma) {
    // Demo mode — return mock transaction
    const ref = generateRef()
    return NextResponse.json({
      transaction: { id: 'demo-txn-1', reference: ref, status: 'PENDING_PAYMENT' }
    }, { status: 201 })
  }

  // Load tier for amounts
  const tier = await prisma.affinityTier.findUnique({ where: { id: tierId } })
  if (!tier) return NextResponse.json({ error: 'Invalid tier.' }, { status: 400 })
  const user = await prisma.user.findUnique({
    where: { email: session.email },
    select: { id: true, affiliateId: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found for session.' }, { status: 401 })
  if (!user.affiliateId) return NextResponse.json({ error: 'User is not linked to an affiliate.' }, { status: 400 })

  const ref = generateRef()

  const transaction = await prisma.transaction.create({
    data: {
      reference:       ref,
      userId:          user.id,
      affiliateId:     user.affiliateId,
      tierId,
      programmeBundle: programmeBundle ?? 'raha_abnic',
      totalAmountAed:  tier.totalAmountAed,
      rahaSplitAed:    tier.rahaSplitAed,
      insurerSplitAed: tier.insurerSplitAed,
      status:          'PENDING_PAYMENT',
      memberKyc: {
        create: {
          fullName:    kyc.fullName,
          whatsapp:    kyc.whatsapp,
          email:       kyc.email,
          dateOfBirth: new Date(kyc.dateOfBirth),
          sponsorId:   kyc.sponsorId,
          emiratesId:  kyc.emiratesId ?? null,
        }
      }
    },
    select: { id: true, reference: true, status: true }
  })

  // Set duplicate guard
  if (kyc.emiratesId) {
    await setDuplicateGuard(kyc.emiratesId, tierId, ref)
  }

  return NextResponse.json({ transaction }, { status: 201 })
}

export async function GET(_req: NextRequest) {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const prisma = getPrisma()
  if (!prisma) return NextResponse.json({ transactions: [] })

  const where = session.role === 'OPERATOR'
    ? {}
    : session.role === 'SUPER_USER'
      ? (session.affiliateId ? { affiliateId: session.affiliateId } : { userId: session.userId })
      : { userId: session.userId }
  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      id: true, reference: true, status: true,
      totalAmountAed: true, programmeBundle: true,
      createdAt: true, completedAt: true,
      rahaCardUrl: true, abnicCardUrl: true,
      memberKyc: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ transactions })
}
