import { NextRequest, NextResponse } from 'next/server'
import { getPrisma }                 from '@/lib/db/prisma'
import { requireSession }            from '@/lib/session'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bundleId: string }> }
) {
  const { session, error } = await requireSession()
  if (error || !session) return error!

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ tiers: [
      { id: 'demo-core',   tierName: 'CORE',   totalAmountAed: 150, rahaSplitAed: 50,  insurerSplitAed: 100, planCode: 'ABNIC-CORE-001',  description: 'Essential coverage', benefits: { coverageLevel: 'Basic',         outpatient: 'Limited',  hospitalisation: 'Emergency only', pharmacyDiscount: '10%', teleconsultation: false, dentalDiscount: null } },
      { id: 'demo-pulse',  tierName: 'PULSE',  totalAmountAed: 250, rahaSplitAed: 75,  insurerSplitAed: 175, planCode: 'ABNIC-PULSE-001', description: 'Standard coverage',  benefits: { coverageLevel: 'Medium',        outpatient: 'Standard', hospitalisation: 'Partial',        pharmacyDiscount: '20%', teleconsultation: true,  dentalDiscount: '5%'  } },
      { id: 'demo-zenith', tierName: 'ZENITH', totalAmountAed: 400, rahaSplitAed: 100, insurerSplitAed: 300, planCode: 'ABNIC-PREM-001', description: 'Premium coverage',   benefits: { coverageLevel: 'Comprehensive', outpatient: 'Full',     hospitalisation: 'Full',           pharmacyDiscount: '30%', teleconsultation: true,  dentalDiscount: '15%' } },
    ]})
  }

  const resolvedParams = await params

  const tiers = await prisma.affinityTier.findMany({
    where: { bundleId: resolvedParams.bundleId, isActive: true },
    select: {
      id: true, tierName: true, totalAmountAed: true,
      rahaSplitAed: true, insurerSplitAed: true,
      planCode: true, description: true, benefits: true,
    },
    orderBy: { totalAmountAed: 'asc' },
  })

  return NextResponse.json({ tiers })
}
