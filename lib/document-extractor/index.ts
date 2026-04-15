import { extractFromPDF, renderPdfPagesAsPngBuffers } from "@/lib/document-extractor/pdf-extractor";
import { parseMRZFromText } from "@/lib/document-extractor/mrz-parser";
import { extractFieldsFromText } from "@/lib/document-extractor/regex-patterns";
import { extractTextFromImage } from "@/lib/document-extractor/tesseract-extractor";

export type ExtractedData = {
  policy_type?: "Individuals/Family" | "Domestic Worker" | "Company";
  sponsor_name?: string;
  sponsor_email?: string;
  sponsor_mobile?: string;
  sponsor_emirates_id?: string;
  trade_license_no?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  dob?: string;
  gender?: "Male" | "Female";
  nationality?: string;
  unified_number?: string;
  member_emirates_id?: string;
  passport_no?: string;
  visa_file_no?: string;
  occupation?: string;
  salary_category?: "Above 4000 AED" | "Below or up to 4000 AED" | "No Salary";
};

export type DocumentType =
  | "PASSPORT"
  | "EMIRATES_ID"
  | "EVISA"
  | "TRADE_LICENSE"
  | "MEDICAL_CERT"
  | "UNKNOWN";

function cleanText(v: string): string {
  return (v || "").trim();
}

export function detectDocumentType(filename: string, text: string): DocumentType {
  const fn = filename.toLowerCase();
  const tx = text.toLowerCase();

  if (
    fn.includes("passport") || fn.includes("جواز") ||
    tx.includes("republic of india") || tx.includes("federal democratic republic of ethiopia") ||
    tx.includes("republic of the philippines") || tx.includes("demokratik") ||
    (tx.includes("passport") && tx.includes("surname"))
  ) return "PASSPORT";

  if (
    fn.includes("eid") || fn.includes("هوية") || fn.includes("identity") ||
    tx.includes("resident identity card") || tx.includes("id number") ||
    tx.includes("بطاقة هوية مقيم")
  ) return "EMIRATES_ID";

  if (
    fn.includes("visa") || fn.includes("evisa") || fn.includes("اقامه") ||
    fn.includes("permit") || fn.includes("residency") ||
    tx.includes("entry permit no") || tx.includes("evisa") ||
    tx.includes("employment/imm") || tx.includes("إذن دخول الكتروني")
  ) return "EVISA";

  if (
    fn.includes("license") || fn.includes("رخصة") || fn.includes("licence") ||
    tx.includes("license number") || tx.includes("business name") ||
    tx.includes("trade license") || tx.includes("commercial license") ||
    tx.includes("professional license")
  ) return "TRADE_LICENSE";

  if (
    fn.includes("fitness") || fn.includes("medical") || fn.includes("فحص") ||
    fn.includes("certificate") ||
    tx.includes("residency screening certificate") ||
    tx.includes("emirates health service") ||
    tx.includes("applicant fit") || tx.includes("لائق طبياً")
  ) return "MEDICAL_CERT";

  return "UNKNOWN";
}

function removeUndefined<T extends object>(obj: T): T {
  Object.keys(obj).forEach((k) => {
    const key = k as keyof T;
    if (obj[key] === undefined || obj[key] === null || obj[key] === "") delete obj[key];
  });
  return obj;
}

export async function extractFromFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
): Promise<{ data: Partial<ExtractedData>; docType: DocumentType }> {
  let text = "";
  let isScanned = false;
  let mrzData: Partial<ExtractedData> = {};

  if (mimeType === "application/pdf") {
    const pdfResult = await extractFromPDF(buffer);
    text = pdfResult.text;
    isScanned = pdfResult.isScanned;
    // For scanned PDFs, OCR first 1-2 rendered pages.
    if (isScanned) {
      const screenshots = await renderPdfPagesAsPngBuffers(buffer, 2);
      if (screenshots.length > 0) {
        const ocrTexts: string[] = [];
        for (const pagePng of screenshots) {
          const t = await extractTextFromImage(pagePng, "image/png");
          if (t.trim()) ocrTexts.push(t.trim());
        }
        if (ocrTexts.length > 0) {
          text = `${text}\n${ocrTexts.join("\n")}`.trim();
        }
      }
    }
    if (!text.trim()) {
      const docType = detectDocumentType(filename, "");
      return { data: {}, docType };
    }
  } else {
    text = await extractTextFromImage(buffer, mimeType);

    if (process.env.NODE_ENV === "development") {
      console.log(`[extractor] text preview:\n${text.slice(0, 600)}`);
    }

    // Try MRZ first — most reliable for EID and passport images
    mrzData = parseMRZFromText(text);

    // If MRZ gave us a name, we are done with identity fields
    const mrzWorked = !!(mrzData.last_name || mrzData.passport_no || mrzData.member_emirates_id);

    if (process.env.NODE_ENV === "development") {
      console.log(`[extractor] MRZ result:`, mrzData);
      console.log(`[extractor] MRZ worked: ${mrzWorked}`);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`\n[extractor] ── ${filename} ──`);
    console.log(`[extractor] mime: ${mimeType}`);
    console.log(`[extractor] text length: ${text.length}`);
    console.log(`[extractor] isScanned: ${isScanned ?? false}`);
    console.log(`[extractor] text (first 600 chars):\n${text.slice(0, 600)}`);
  }

  const docType = detectDocumentType(filename, text);
  const regexData = extractFieldsFromText(text);

  // Inside extractFromFile, replace the final merge block:
  const merged: Partial<ExtractedData> = { ...regexData };

  // MRZ wins over regex for these identity fields (MRZ is more reliable)
  const mrzPriorityFields: Array<keyof ExtractedData> = [
    "first_name", "middle_name", "last_name",
    "dob", "gender", "nationality", "passport_no",
  ];
  for (const field of mrzPriorityFields) {
    const mrzVal = mrzData[field as keyof typeof mrzData];
    if (mrzVal !== undefined && mrzVal !== "") {
      (merged as Record<string, unknown>)[field] = mrzVal;
    }
  }

  return { data: removeUndefined(merged), docType };
}

export function mergeExtractions(results: Partial<ExtractedData>[]): Partial<ExtractedData> {
  const merged: Partial<ExtractedData> = {};
  for (const result of results) {
    for (const key of Object.keys(result) as Array<keyof ExtractedData>) {
      const val = result[key];
      if (val !== undefined && val !== "" && val !== null) {
        (merged as Record<string, unknown>)[key] = val;
      }
    }
  }
  return merged;
}

export function inferPolicyType(
  merged: Partial<ExtractedData>,
  docTypes: DocumentType[],
): "Individuals/Family" | "Domestic Worker" | "Company" {
  if (docTypes.includes("TRADE_LICENSE") || merged.trade_license_no) return "Company";
  const domesticOccupations = ["housemaid", "cook", "driver", "cleaner", "maid", "domestic"];
  if (merged.occupation && domesticOccupations.some((o) => merged.occupation!.toLowerCase().includes(o))) {
    return "Domestic Worker";
  }
  return "Individuals/Family";
}

export function inferSalaryCategory(
  merged: Partial<ExtractedData>,
): "Above 4000 AED" | "Below or up to 4000 AED" | "No Salary" {
  if (merged.salary_category) return merged.salary_category;
  const occ = (merged.occupation || "").toLowerCase();
  const domestic = ["housemaid", "cook", "maid", "domestic", "cleaner"];
  const low = ["labourer", "laborer", "helper", "cleaner", "launderer", "painter", "shop assistant", "maintenance", "ac assistant"];
  if (domestic.some((o) => occ.includes(o))) return "No Salary";
  if (low.some((o) => occ.includes(o))) return "Below or up to 4000 AED";
  return "Above 4000 AED";
}

