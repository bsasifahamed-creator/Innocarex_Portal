import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";
import { getPrisma } from "@/lib/db/prisma";
import type { DocumentType } from "@/lib/document-extractor";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function detectMime(file: File): string {
  if (file.type) return file.type;
  const n = file.name.toLowerCase();
  if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  if (n.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

const PROMPT = `You are a UAE insurance document extraction assistant.
I am uploading UAE documents. They may include any combination of:
Passport, Emirates ID front, Emirates ID back, eVisa / UAE Entry Permit,
Residence Permit card, Medical Fitness Certificate, Trade License.

Extract ALL visible data from ALL uploaded documents combined.
Return ONLY a valid JSON object — no explanation, no markdown, no code fences.

JSON structure (return ALL fields, use empty string "" for missing):
{
  "policy_type": "Individuals/Family" or "Domestic Worker" or "Company",
  "sponsor_name": "",
  "sponsor_email": "",
  "sponsor_mobile": "",
  "sponsor_emirates_id": "",
  "trade_license_no": "",
  "first_name": "",
  "middle_name": "",
  "last_name": "",
  "dob": "DD/MM/YYYY",
  "gender": "Male" or "Female",
  "nationality": "",
  "unified_number": "",
  "member_emirates_id": "",
  "passport_no": "",
  "visa_file_no": "",
  "occupation": "",
  "salary_category": "Above 4000 AED" or "Below or up to 4000 AED" or "No Salary"
}

RULES:
1. NAME: Use passport MRZ as primary source.
   MRZ format: SURNAME<<FIRSTNAME<MIDDLENAME
   first_name = first given name only
   middle_name = all remaining given names joined with space
   last_name = surname / family name

2. DOB: Always DD/MM/YYYY. Cross-check all documents.

3. EMIRATES ID format: 784-YYYY-NNNNNNN-N (always with dashes).
   If you see 15 digits like 784199575149846 reformat to 784-1995-7514984-6.
   SPONSOR EID: if eVisa shows "Employer Identity Number" those digits = sponsor EID.
   MEMBER EID: the EID card belongs to the member.

4. VISA FILE NO: from eVisa "Entry Permit No" or Residence Permit.
   Format xxx/xxxx/x/xxxxxxx — remove all spaces inside the number.
   Examples: 701/2026/2/0001920  401/2026/7/0013245

5. UNIFIED NUMBER: 8-digit number from "U.I.D No" or "Unified Number"
   or Arabic "الرقم الموحد" on eVisa or Medical Cert.

6. NATIONALITY: full English country name.
   ETHIOPIAN→Ethiopia, INDIAN→India, FILIPINO→Philippines,
   NEPALI→Nepal, SRI LANKAN→Sri Lanka, PAKISTANI→Pakistan,
   BANGLADESHI→Bangladesh, EGYPTIAN→Egypt, GERMAN→Germany,
   SYRIAN→Syria, STATE OF PALESTINE→Palestine, BURUNDIAN→Burundi,
   INDONESIAN→Indonesia, UNITED ARAB EMIRATES→United Arab Emirates.

7. SPONSOR vs MEMBER:
   UAE National EID present with foreign worker doc → UAE National is sponsor.
   Trade License present → policy_type=Company, company name→sponsor_name,
     license number→trade_license_no.
   Occupation is Housemaid/Cook/Maid/Driver under Emirati individual →
     policy_type=Domestic Worker.

8. SALARY:
   No Salary → Housemaid, Cook, Maid, domestic workers, dependents.
   Below or up to 4000 AED → Labourer, Cleaner, Maintenance, Painter,
     Shop Assistant, AC Assistant, Launderer.
   Above 4000 AED → all other employed members.

9. If a field is not visible in any document → use empty string "".

Output ONLY the JSON. Nothing else.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (!files.length) {
      return NextResponse.json({ ok: false, error: "No files uploaded." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing ANTHROPIC_API_KEY in environment." },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey });

    type ContentBlock =
      | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "document"; source: { type: "base64"; media_type: string; data: string } }
      | { type: "text"; text: string };

    const blocks: ContentBlock[] = [];

    for (const file of files) {
      const mimeType = detectMime(file);
      if (!ALLOWED_TYPES.has(mimeType)) continue;

      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");

      if (mimeType === "application/pdf") {
        blocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        });
      } else if (mimeType.startsWith("image/")) {
        blocks.push({
          type: "image",
          source: { type: "base64", media_type: mimeType, data: base64 },
        });
      }
    }

    if (!blocks.length) {
      return NextResponse.json(
        { ok: false, error: "No supported files. Use PDF, JPG, PNG, or WEBP." },
        { status: 400 },
      );
    }

    blocks.push({ type: "text", text: PROMPT });

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [{ role: "user", content: blocks as any }],
    });

    const rawText = (response.content as any[])
      .filter((b) => b?.type === "text")
      .map((b) => String(b?.text ?? ""))
      .join("")
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    // Extract JSON object even if Claude adds surrounding text.
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    const jsonCandidate = firstBrace >= 0 && lastBrace >= firstBrace ? rawText.slice(firstBrace, lastBrace + 1) : rawText;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonCandidate);
    } catch (e) {
      console.error("[extract-documents] JSON parse failed:", rawText);
      return NextResponse.json(
        { ok: false, error: "Could not parse extraction result." },
        { status: 500 },
      );
    }

    const keys = [
      "policy_type",
      "sponsor_name",
      "sponsor_email",
      "sponsor_mobile",
      "sponsor_emirates_id",
      "trade_license_no",
      "first_name",
      "middle_name",
      "last_name",
      "dob",
      "gender",
      "nationality",
      "unified_number",
      "member_emirates_id",
      "passport_no",
      "visa_file_no",
      "occupation",
      "salary_category",
    ] as const;

    const extracted: Record<string, string> = {};
    for (const k of keys) {
      const v = parsed?.[k];
      extracted[k] = typeof v === "string" ? v : "";
    }

    if (!extracted.sponsor_email) extracted.sponsor_email = "ahlantypinguae@gmail.com";

    // Save to DB (non-fatal)
    const prisma = getPrisma();
    if (prisma) {
      try {
        for (const file of files) {
          const mimeType = detectMime(file);
          if (!ALLOWED_TYPES.has(mimeType)) continue;
          await prisma.documentAsset.create({
            data: {
              documentType: detectDocType(file.name) as DocumentType,
              originalName: file.name,
              storagePath: null,
              parseResult: extracted as Prisma.InputJsonValue,
            },
          });
        }
      } catch (dbErr) {
        console.warn("[extract-documents] DB save failed (non-fatal):", dbErr);
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[extract-documents] extracted:", JSON.stringify(extracted));
    }

    return NextResponse.json({ ok: true, data: extracted });
  } catch (err) {
    console.error("[extract-documents]", err);
    return NextResponse.json({ ok: false, error: "Extraction failed. Please try again." }, { status: 500 });
  }
}

function detectDocType(filename: string): DocumentType {
  const f = filename.toLowerCase();
  if (f.includes("passport") || f.includes("جواز")) return "PASSPORT";
  if (f.includes("eid") || f.includes("هوية") || f.includes("identity")) return "EMIRATES_ID";
  if (f.includes("visa") || f.includes("evisa") || f.includes("اقامه") || f.includes("permit")) return "EVISA";
  if (f.includes("license") || f.includes("licence") || f.includes("رخصة") || f.includes("trade")) return "TRADE_LICENSE";
  if (f.includes("fitness") || f.includes("medical") || f.includes("فحص") || f.includes("certificate")) return "MEDICAL_CERT";
  return "UNKNOWN";
}

