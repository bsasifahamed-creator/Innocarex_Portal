import { config } from "dotenv"
import { resolve } from "node:path"

config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { hash } from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding Portal X...")

  // Affinity bundle
  const bundle = await prisma.affinityBundle.upsert({
    where: { name: "raha_abnic" },
    update: {},
    create: { name: "raha_abnic", displayName: "Raha with ABNIC", isActive: true },
  })

  // Tiers
  const tiers = [
    { tierName: "CORE"   as const, totalAmountAed: 150, rahaSplitAed: 50,  insurerSplitAed: 100, planCode: "ABNIC-CORE-001",  description: "Essential coverage", benefits: { coverageLevel: "Basic",         pharmacyDiscount: "10%", teleconsultation: false } },
    { tierName: "PULSE"  as const, totalAmountAed: 250, rahaSplitAed: 75,  insurerSplitAed: 175, planCode: "ABNIC-PULSE-001", description: "Standard coverage",  benefits: { coverageLevel: "Medium",        pharmacyDiscount: "20%", teleconsultation: true  } },
    { tierName: "ZENITH" as const, totalAmountAed: 400, rahaSplitAed: 100, insurerSplitAed: 300, planCode: "ABNIC-PREM-001",  description: "Premium coverage",   benefits: { coverageLevel: "Comprehensive", pharmacyDiscount: "30%", teleconsultation: true  } },
  ]

  for (const tier of tiers) {
    await prisma.affinityTier.upsert({
      where: { bundleId_tierName: { bundleId: bundle.id, tierName: tier.tierName } },
      update: tier,
      create: { bundleId: bundle.id, ...tier },
    })
    console.log(`  ✓ ${tier.tierName} — AED ${tier.totalAmountAed}`)
  }

  // Affiliate
  const affiliate = await prisma.affiliate.upsert({
    where: { code: "typingcentrea" },
    update: {},
    create: {
      code: "typingcentrea",
      name: "Typing Centre A",
      affiliateType: "TYPING_CENTRE",
      status: "ACTIVE",
      config: { productVisibility: ["raha_abnic"] },
    },
  })
  console.log(`  ✓ Affiliate: ${affiliate.name}`)

  // Demo users
  const superHash = await hash("demo123", 12)
  const subHash   = await hash("demo123", 12)

  await prisma.user.upsert({
    where: { email: "superusertypingcentrea@portalx.com" },
    update: { role: "SUPER_USER", affiliateId: affiliate.id },
    create: {
      email:        "superusertypingcentrea@portalx.com",
      passwordHash: superHash,
      role:         "SUPER_USER",
      affiliateId:  affiliate.id,
    },
  })
  console.log("  ✓ Ali Hassan (SUPER_USER)")

  await prisma.user.upsert({
    where: { email: "user1typingcentrea@portalx.com" },
    update: { role: "SUB_USER", affiliateId: affiliate.id },
    create: {
      email:        "user1typingcentrea@portalx.com",
      passwordHash: subHash,
      role:         "SUB_USER",
      affiliateId:  affiliate.id,
    },
  })
  console.log("  ✓ Sara Al Mansoori (SUB_USER)")

  console.log("\n✅ Seed complete.")
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
