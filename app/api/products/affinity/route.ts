import { NextResponse }  from 'next/server'
import { getPrisma }     from '@/lib/db/prisma'
import { requireSession } from '@/lib/session'

export async function GET() {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ bundles: [
      { id: 'demo-bundle-1', name: 'raha_abnic', displayName: 'Raha with ABNIC' }
    ]})
  }

  const bundles = await prisma.affinityBundle.findMany({
    where: { isActive: true },
    select: { id: true, name: true, displayName: true },
    orderBy: { displayName: 'asc' },
  })

  return NextResponse.json({ bundles })
}
