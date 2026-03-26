import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";
import { runLocalIntake } from "@/lib/documents/localIntake";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

async function persistParse(request: Request, file: File, documentType: string, result: Record<string, unknown>) {
  const prisma = getPrisma();
  if (!prisma) return;
  const session = await getPortalSessionFromRequest(request);
  let userId: string | undefined;
  if (session) {
    const u = await prisma.user.findUnique({ where: { email: session.email } });
    userId = u?.id;
  }
  await prisma.documentAsset.create({
    data: {
      userId,
      documentType,
      originalName: file.name,
      parseResult: result as Prisma.InputJsonValue,
    },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const document_type = String(formData.get("document_type") || "auto");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: { code: "no_file" } }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const base = (process.env.DOCUMENT_INTAKE_URL || "").replace(/\/$/, "");

  if (base) {
    try {
      const fd = new FormData();
      fd.append("file", new Blob([buf], { type: mime }), file.name);
      fd.append("document_type", document_type);
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 120000);
      const upstream = await fetch(base + "/v1/mrz/parse", {
        method: "POST",
        body: fd,
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      const text = await upstream.text();
      let json: Record<string, unknown> | null = null;
      try {
        json = JSON.parse(text) as Record<string, unknown>;
      } catch {
        json = { raw: text };
      }
      if (upstream.ok && json && json.success === true) {
        const out = { ...json, source_pipeline: "python" };
        await persistParse(request, file, document_type, out as Record<string, unknown>);
        return NextResponse.json(out);
      }
    } catch {
      /* local fallback */
    }
  }

  const local = await runLocalIntake(buf, mime, document_type, file.name);
  const payload =
    local && typeof local === "object" && local !== null
      ? (local as Record<string, unknown>)
      : { result: local } as Record<string, unknown>;
  await persistParse(request, file, document_type, payload);
  return NextResponse.json(local);
}
