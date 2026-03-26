import { createWorker, PSM } from "tesseract.js";

export type LocalIntakeResult = {
  success: boolean;
  document_type: string;
  fields: Record<string, unknown>;
  checksum_valid: boolean;
  anomalies: string[];
  source_pipeline: "next_local";
  raw_ocr_preview?: string;
  hint?: string;
};

function cleanMrzLine(line: string): string {
  return line.replace(/[^A-Za-z0-9<]/g, "").toUpperCase();
}

function extractMrzLines(text: string): string[] {
  const lines = text.split(/\r?\n/).map((l) => cleanMrzLine(l)).filter(Boolean);
  const mrz = lines.filter((l) => l.length >= 28 && l.includes("<"));
  const td3 = mrz.filter((l) => l.length >= 40);
  if (td3.length >= 2) return td3.slice(-2);
  if (mrz.length >= 3) return mrz.slice(-3);
  if (mrz.length >= 2) return mrz.slice(-2);
  return [];
}

function extractUid(text: string): string | null {
  const compact = text.replace(/\s/g, "");
  const re = new RegExp("784\\d{12}");
  const m = compact.match(re);
  return m ? m[0] : null;
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const tr = await parser.getText();
    return tr.text || "";
  } finally {
    await parser.destroy();
  }
}

async function runTesseract(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text || "";
  } finally {
    await worker.terminate();
  }
}

export async function runLocalIntake(
  buffer: Buffer,
  mime: string,
  documentType: string,
  filename: string,
): Promise<LocalIntakeResult> {
  const lower = mime.toLowerCase();
  const isPdf =
    lower.includes("pdf") || filename.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    try {
      const text = await extractPdfText(buffer);
      const ok = text.trim().length > 30;
      return {
        success: ok,
        document_type: "digital_pdf",
        fields: { text: text.slice(0, 50000) },
        checksum_valid: ok,
        anomalies: ok ? [] : ["no_text_layer_or_empty"],
        source_pipeline: "next_local",
        hint: ok
          ? "Text layer extracted with pdf-parse (no OCR)."
          : "No text in PDF. Save scan as PNG/JPG for OCR.",
      };
    } catch (e) {
      return {
        success: false,
        document_type: "digital_pdf",
        fields: {},
        checksum_valid: false,
        anomalies: ["pdf_parse_failed"],
        source_pipeline: "next_local",
        hint: e instanceof Error ? e.message : "pdf-parse error",
      };
    }
  }

  let text: string;
  try {
    text = await runTesseract(buffer);
  } catch (e) {
    return {
      success: false,
      document_type: documentType || "image_ocr",
      fields: {},
      checksum_valid: false,
      anomalies: ["tesseract_failed"],
      source_pipeline: "next_local",
      hint: e instanceof Error ? e.message : "Tesseract.js failed (first run downloads language data).",
    };
  }

  const preview = text.slice(0, 800);
  const uid = extractUid(text);
  const mrz = extractMrzLines(text);

  if (uid) {
    return {
      success: true,
      document_type: "emirates_id_front_ocr",
      fields: { uid_15: uid, full_text_excerpt: text.slice(0, 2000) },
      checksum_valid: false,
      anomalies: [],
      source_pipeline: "next_local",
      raw_ocr_preview: preview,
      hint: "UAE UID found in OCR text. For EID barcode use Python pyzbar when service runs.",
    };
  }

  if ((documentType === "passport" || documentType === "auto") && mrz.length >= 2) {
    return {
      success: true,
      document_type: "passport_td3_ocr_raw",
      fields: {
        mrz_line1: mrz[0],
        mrz_line2: mrz[1],
      },
      checksum_valid: false,
      anomalies: ["checksum_not_validated_locally"],
      source_pipeline: "next_local",
      raw_ocr_preview: preview,
      hint: "MRZ-like lines found. Use Python /v1/mrz/validate-string for ICAO checksum.",
    };
  }

  return {
    success: text.trim().length > 20,
    document_type: documentType === "auto" ? "image_ocr" : documentType,
    fields: { full_text_excerpt: text.slice(0, 3000) },
    checksum_valid: false,
    anomalies: text.trim().length > 20 ? ["no_uid_or_mrz_detected"] : ["ocr_empty"],
    source_pipeline: "next_local",
    raw_ocr_preview: preview,
    hint: "Try clearer scan, correct document type, or run Python service for barcode/MRZ.",
  };
}
