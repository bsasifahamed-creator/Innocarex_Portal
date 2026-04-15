import { PrismaClient } from "@prisma/client"
import { PrismaPg }     from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export function getPrisma(): PrismaClient | null {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return null

  if (
    url.includes("johndoe:randompassword") &&
    url.includes("localhost:5432") &&
    url.includes("/mydb")
  ) {
    return null
  }

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: url })
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    } as any)
  }

  return globalForPrisma.prisma
}
