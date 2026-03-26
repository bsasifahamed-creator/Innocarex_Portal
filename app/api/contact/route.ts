import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db/prisma";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json" } }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation" } }, { status: 400 });
  }
  const row = {
    ...parsed.data,
    receivedAt: new Date().toISOString(),
  };

  const prisma = getPrisma();
  if (prisma) {
    await prisma.contactLead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company,
        message: parsed.data.message,
      },
    });
  }

  const dir = path.join(process.cwd(), "data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "contact.jsonl"), JSON.stringify(row) + "\n", "utf8");

  return NextResponse.json({ ok: true, persisted: Boolean(prisma) });
}
