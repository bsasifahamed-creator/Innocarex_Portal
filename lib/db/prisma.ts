import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;

  // Prisma init template placeholder (common when people haven't created a real .env.local yet).
  // Treat it as "DB not configured" so the app can run in demo mode.
  if (
    url.includes("johndoe:randompassword") &&
    url.includes("localhost:5432") &&
    url.includes("/mydb")
  ) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}
