import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  const demoEmail = (process.env.DEMO_PORTAL_EMAIL || "demo@innocarex.ae").trim().toLowerCase();
  const demoPass = process.env.DEMO_PORTAL_PASSWORD || "innocarex-demo";
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@innocarex.ae").trim().toLowerCase();
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "admin-innocarex-dev";

  const demoHash = await hash(demoPass, 12);
  const adminHash = await hash(adminPass, 12);

  await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      passwordHash: demoHash,
      role: UserRole.BROKER,
    },
    update: { passwordHash: demoHash, isActive: true },
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
    update: { passwordHash: adminHash, isActive: true },
  });

  console.log("Seeded users:", demoEmail, "(BROKER),", adminEmail, "(ADMIN)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
