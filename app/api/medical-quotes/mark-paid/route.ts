import { mkdir, readFile, writeFile } from "fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getPortalSessionFromRequest } from "@/lib/auth/portalSession";
import { getPrisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  quoteId: z.string().min(3),
});

async function generateReceiptPdfBytes(params: { quoteId: string; paymentLink: string }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText("Payment Confirmation (Demo)", { x: 48, y: 780, size: 18, font: bold, color: rgb(0.05, 0.1, 0.2) });
  page.drawText(`Quote ID: ${params.quoteId}`, { x: 48, y: 754, size: 11, font, color: rgb(0.2, 0.3, 0.4) });
  page.drawText("Status: PAID", { x: 48, y: 730, size: 12, font: bold, color: rgb(0.02, 0.5, 0.2) });
  page.drawText(`Payment link: ${params.paymentLink}`, { x: 48, y: 690, size: 10, font, color: rgb(0.1, 0.12, 0.18) });

  page.drawText("Demo mode: documents are generated for portal testing.", { x: 48, y: 120, size: 9, font, color: rgb(0.4, 0.42, 0.45) });
  return pdf.save();
}

export async function POST(request: Request) {
  const session = await getPortalSessionFromRequest(request);
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "invalid_json" } }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "validation", details: parsed.error.flatten() } }, { status: 400 });
  }

  const { quoteId } = parsed.data;
  const dir = path.join(process.cwd(), "data", "medical-quotes", quoteId);
  const draftPath = path.join(dir, "draft.json");

  let draft: any;
  try {
    const raw = await readFile(draftPath, "utf8");
    draft = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: { code: "quote_not_found" } }, { status: 404 });
  }

  if (draft?.status === "PAID") {
    // Continue to return docs below.
  }

  const paymentLink = String(draft?.paymentLink || "");
  const paidStatus = "PAID";
  const receiptBytes = await generateReceiptPdfBytes({ quoteId, paymentLink });
  await writeFile(path.join(dir, "payment-receipt.pdf"), receiptBytes);
  await writeFile(
    draftPath,
    JSON.stringify(
      {
        ...draft,
        status: paidStatus,
        paidAt: new Date().toISOString(),
        paidBy: session?.email ?? null,
      },
      null,
      2,
    ),
    "utf8",
  );

  // Read the previously generated quotation PDF.
  const quotationPath = path.join(dir, "quotation.pdf");
  const quotationBytes = await readFile(quotationPath);

  // Declaration PDF (simple demo).
  const declarationPdf = await (async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawText("Declaration", { x: 48, y: 780, size: 18, font: bold, color: rgb(0.05, 0.1, 0.2) });
    page.drawText("I confirm that the information provided is true and complete to the best of my knowledge.", { x: 48, y: 720, size: 11, font, color: rgb(0.1, 0.12, 0.18) });
    page.drawText("This is a demo document for portal testing.", { x: 48, y: 120, size: 9, font, color: rgb(0.4, 0.42, 0.45) });
    return pdf.save();
  })();
  await writeFile(path.join(dir, "declaration.pdf"), declarationPdf);

  // Return base64 for UI downloads.
  return NextResponse.json({
    ok: true,
    quoteId,
    status: paidStatus,
    documents: [
      {
        type: "quotation",
        filename: "quotation.pdf",
        base64: Buffer.from(quotationBytes).toString("base64"),
      },
      {
        type: "declaration",
        filename: "declaration.pdf",
        base64: Buffer.from(declarationPdf).toString("base64"),
      },
      {
        type: "payment-receipt",
        filename: "payment-receipt.pdf",
        base64: Buffer.from(receiptBytes).toString("base64"),
      },
    ],
  });
}

