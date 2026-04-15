import type { ExtractedData } from "./index";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Remove whitespace from inside a visa file number so
 * "401 / 2026 / 7/0013245" becomes "401/2026/7/0013245"
 */
function cleanVisaNo(raw: string): string {
  return raw.replace(/\s/g, "");
}

/**
 * Reformat a 15-digit EID string (no dashes) to 784-YYYY-NNNNNNN-N
 * Works for both member EID and employer/sponsor EID from eVisa.
 */
export function reformatEID(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 15 && digits.startsWith("784")) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 14)}-${digits.slice(14)}`;
  }
  // Already formatted or different length — return as-is
  return raw.trim();
}

/**
 * Normalize any date string to DD/MM/YYYY.
 * Handles: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY
 */
export function normalizeDate(raw: string): string {
  const s = raw.trim();
  // YYYY-MM-DD (medical cert format 2)
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  // DD/MM/YYYY or DD-MM-YYYY
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;
  // DD/MM/YY
  m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
  if (m) {
    const yy = parseInt(m[3]);
    const yyyy = yy > 30 ? `19${m[3]}` : `20${m[3]}`;
    return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${yyyy}`;
  }
  return s;
}

/**
 * Map raw nationality strings (as they appear in extracted text) to
 * clean English country names.
 */
export function mapNationality(raw: string): string {
  const s = raw.trim().toUpperCase();
  const map: Record<string, string> = {
    ETHIOPIAN: "Ethiopia",
    ETHIOPIA: "Ethiopia",
    INDIAN: "India",
    INDIA: "India",
    FILIPINO: "Philippines",
    PHILIPPINES: "Philippines",
    "THE PHILIPPINES": "Philippines",
    NEPALI: "Nepal",
    NEPAL: "Nepal",
    "SRI LANKAN": "Sri Lanka",
    "SRI LANKA": "Sri Lanka",
    PAKISTANI: "Pakistan",
    PAKISTAN: "Pakistan",
    BANGLADESHI: "Bangladesh",
    BANGLADESH: "Bangladesh",
    EGYPTIAN: "Egypt",
    EGYPT: "Egypt",
    GERMAN: "Germany",
    GERMANY: "Germany",
    SYRIAN: "Syria",
    SYRIA: "Syria",
    LEBANESE: "Lebanon",
    LEBANON: "Lebanon",
    PALESTINIAN: "Palestine",
    "STATE OF PALESTINE": "Palestine",
    PALESTINE: "Palestine",
    BURUNDIAN: "Burundi",
    BURUNDI: "Burundi",
    INDONESIAN: "Indonesia",
    INDONESIA: "Indonesia",
    "UNITED ARAB EMIRATES": "United Arab Emirates",
    EMIRATI: "United Arab Emirates",
    UAE: "United Arab Emirates",
  };
  return map[s] ?? raw.trim();
}

// ─────────────────────────────────────────────
// KNOWN UAE NATIONALITIES for name-prefix stripping
// ─────────────────────────────────────────────
const NATIONALITY_PREFIXES = [
  "ETHIOPIA", "INDIA", "NEPAL", "PHILIPPINES", "PAKISTAN", "BANGLADESH",
  "EGYPT", "GERMANY", "SYRIA", "LEBANON", "PALESTINE", "BURUNDI",
  "INDONESIA", "JORDAN", "SUDAN", "NIGERIA", "KENYA", "GHANA",
];

/**
 * In eVisa PDFs, Full Name sometimes has the nationality prepended:
 *   "ETHIOPIA DAMTAW MENGESHA" → "DAMTAW MENGESHA"
 * Strip if the first word matches a known nationality.
 */
function stripNationalityPrefix(name: string): string {
  const upper = name.trim().toUpperCase();
  for (const prefix of NATIONALITY_PREFIXES) {
    if (upper.startsWith(prefix + " ")) {
      return name.trim().slice(prefix.length).trim();
    }
  }
  return name.trim();
}

/**
 * Split a full name string into first / middle / last.
 * Input: "DAMTAW MENGESHA" → first=DAMTAW middle="" last=MENGESHA
 * Input: "JEHAD A M SHREETAH" → first=JEHAD middle="A M" last=SHREETAH
 */
function splitFullName(full: string): {
  first_name: string;
  middle_name: string;
  last_name: string;
} {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", middle_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: "", middle_name: "", last_name: parts[0] };
  if (parts.length === 2) return { first_name: parts[0], middle_name: "", last_name: parts[1] };
  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}

function sanitizeHumanName(raw: string): string {
  return raw
    .replace(/[^A-Za-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Try each pattern in order. Return the first match's capture group 1,
 * or null if none match.
 */
function firstMatch(
  text: string,
  patterns: Array<RegExp>
): string | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

export function extractFieldsFromText(text: string): Partial<ExtractedData> {
  // NOTE ON EID CARDS:
  // EID PDFs are always scanned images — pdf-parse returns 0 bytes.
  // Name extraction from EID only works when the user uploads the
  // EID as JPG/PNG (not PDF), which goes through Tesseract OCR.
  // Instruct users to upload EID as image for best results.
  // For sponsor name: upload the eVisa PDF instead — it contains
  // the employer name in English and extracts reliably.
  const result: Partial<ExtractedData> = {};

  // ── VISA FILE NUMBER ──────────────────────────────────────────────
  // eVisa: "ENTRY PERMIT NO \n:\n301 / 2025 / 7/0128358"
  // Medical: "Entry Permit / Residance No\n701/2014/2/5980"
  // Medical: "Residence Number\n701/2026/2/1920"
  const rawVisa = firstMatch(text, [
    /ENTRY PERMIT NO\s*\n\s*:\s*\n\s*([0-9]{3}[\s]*\/[\s]*[0-9]{4}[\s]*\/[\s]*[0-9][\s]*\/[\s]*[0-9]+)/i,
    /(?:Entry Permit|Residance No|Residence Number)[\s\/A-Za-z]*\n\s*([0-9]{3}\/[0-9]{4}\/[0-9]\/[0-9]+)/i,
    /([0-9]{3}\s*\/\s*[0-9]{4}\s*\/\s*[0-9]\s*\/\s*[0-9]{3,10})/,
  ]);
  if (rawVisa) result.visa_file_no = cleanVisaNo(rawVisa);

  // ── UNIFIED NUMBER (UID) ──────────────────────────────────────────
  // eVisa: number appears BEFORE the Arabic label "دحوملا مقرلا"
  // Medical cert v1: "Unified Number 88160824" (inline)
  // Medical cert v2: "Unified Number\n73220447" (next line)
  const rawUid = firstMatch(text, [
    /\b([0-9]{7,10})\s*\n\s*:\s*\n\s*دحوملا مقرلا/,
    /\b([0-9]{7,10})\b(?=[\s\S]{0,50}دحوملا)/,
    /Unified\s+Number\s+([0-9]{7,10})/i,
    /Unified\s+Number\s*\n\s*([0-9]{7,10})/i,
    /دحوملا مقرلا\s*\n?\s*([0-9]{7,10})/,
  ]);
  if (rawUid) result.unified_number = rawUid;

  // ── EMIRATES ID (member) ──────────────────────────────────────────
  // Formatted: "784-1995-7514984-6"
  // Unformatted 15-digit: "784198564739393" (from EIDA Application No field)
  const rawEid = firstMatch(text, [
    /ID Number\s*[\/\n\s:]+\s*(784[-\s][0-9]{4}[-\s][0-9]{7}[-\s][0-9])/i,
    /رقم الهوية\s*[\/\n\s:]*\s*(784[-\s][0-9]{4}[-\s][0-9]{7}[-\s][0-9])/,
    /EIDA[^0-9\n]*\n?\s*[^0-9\n]*\n?\s*([0-9]{15})/i,
    /\b(784-[0-9]{4}-[0-9]{7}-[0-9])\b/,
    /\b(784[0-9]{12})\b/,
  ]);
  if (rawEid) result.member_emirates_id = reformatEID(rawEid);

  // ── EMPLOYER / SPONSOR EID (from eVisa) ──────────────────────────
  // "Employer Identity Number\n:\n784197435390360"
  const rawEmpId = firstMatch(text, [
    /Employer\s+Identity\s+Number\s*\n\s*:\s*\n\s*(784[0-9]{12})/i,
    /Employer\s+Identity\s+Number[\s:\n]+(784[0-9]{12})/i,
    /لمعلا بحاص ةيوه مقر[\s\S]{0,20}(784[0-9]{12})/,
    /رقم هوية صاحب العمل[\s:\n]+(784[0-9]{12})/,
  ]);
  if (rawEmpId) result.sponsor_emirates_id = reformatEID(rawEmpId);

  // ── PASSPORT NUMBER ───────────────────────────────────────────────
  // eVisa: "EP9352395 / ORDINARY PASSPORT" or "C4KFZGTC1 / ORDINARY PASSPORT"
  // Trade license: "Passport No / ...\nC4KFZGTC1"
  const rawPassport = firstMatch(text, [
    /([A-Z][A-Z0-9]{4,14})\s*\/\s*ORDINARY PASSPORT/i,
    /Passport No[^0-9A-Z\n]*\n?\s*([A-Z][A-Z0-9]{4,14})/i,
    /زاوجلا مقر[^0-9A-Z\n]*\n?\s*([A-Z][A-Z0-9]{4,14})/,
  ]);
  if (rawPassport) result.passport_no = rawPassport.replace(/\s/g, "").toUpperCase();

  // ── DATE OF BIRTH ─────────────────────────────────────────────────
  // eVisa: "Date of Birth\n:\n:\n22/11/1969"
  // Medical v1: "Date Of Birth\n24-11-1997"
  // Medical v2: "Date Of Birth\n1985-04-05"
  const rawDob = firstMatch(text, [
    /(?:Date of Birth|Date Of Birth)\s*\n\s*:\s*\n\s*:?\s*\n\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{4})/i,
    /(?:Date of Birth|Date Of Birth|تاريخ الميلاد|دليملا خيرات)\s*[\n:]{1,4}\s*([0-9]{1,4}[-\/][0-9]{1,2}[-\/][0-9]{2,4})/i,
    /\b([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})\b/,
    /\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b/,
  ]);
  if (rawDob) result.dob = normalizeDate(rawDob);

  // ── FULL NAME ──────────────────────────────────────────────────────
  // Priority order: medical cert English name → eVisa Full Name →
  // EID card Name field (OCR) → fallback broad patterns

  const rawName = firstMatch(text, [
    // Medical cert: "Full name in English\nJEHAD A M SHREETAH"
    /Full\s+name\s+in\s+English\s*\n\s*([A-Z][A-Z\s]{3,80}?)(?:\n|$)/i,

    // eVisa: "Full Name :\nTARIF AMRO\nGERMANY"
    // Captures first line after label — stops at next newline
    /Full\s+Name\s*:\s*\n\s*([A-Z][A-Z\s]{2,80}?)(?:\n)/i,

    // Medical application form: "English Name\nABDESO MUNDINO ADEM"
    /English\s+Name\s*\n\s*([A-Z][A-Z\s]{3,60}?)(?:\n)/i,

    // EID card OCR output (Tesseract): "Name:  Abdulla Mohammed Abdulla"
    // The colon may have extra spaces from OCR
    /^Name\s*:\s+([A-Za-z][A-Za-z\s]{3,80}?)$/m,

    // EID card OCR fallback — label and value on same line
    /Name\s*:\s+([A-Za-z][A-Za-z\s]{3,80}?)(?:\n|$)/i,

    // Residence permit card OCR: "Raju Ebithwar Devaraju Ebithwar"
    // appears after "Name:" label on resident card
    /Name:\s*\n\s*([A-Za-z][A-Za-z\s]{3,60}?)(?:\n)/i,
    // OCR-noisy EID fallback: include up to one extra line after Name:
    /Name\s*:\s*([^\n]{3,120}(?:\n[^\n]{2,80})?)/i,
  ]);

  if (rawName) {
    // Take only first line (remove any OCR noise on subsequent lines)
    const compact = rawName
      .split("\n")
      .slice(0, 2)
      .map((s) => sanitizeHumanName(s))
      // OCR fragments sometimes come as 1-char noise like "H" (from "H €").
      // If we keep those, it breaks last_name length validation in the frontend.
      .filter((s) => s.length >= 2)
      .join(" ")
      .trim();
    const cleaned = stripNationalityPrefix(compact);
    if (cleaned.length >= 2) {
      Object.assign(result, splitFullName(cleaned));
    }
  }

  // ── NATIONALITY ───────────────────────────────────────────────────
  // eVisa: "Nationality :\nGERMANY\nMADRID" — take first line after label
  // Medical: "Nationality\nState of Palestine"
  const rawNat = firstMatch(text, [
    // OCR inline: "Nationality: United Arab Emirates |"
    /Nationality\s*:\s*([A-Za-z][A-Za-z\s]{2,60}?)(?=\s*\||\n|$)/i,
    /Nationality\s*:\s*\n\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n)/i,
    /Nationality\s*\n\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n)/i,
    /ةيسنجلا[\s\S]{0,10}\n\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n)/,
  ]);
  if (rawNat) result.nationality = mapNationality(rawNat.split("\n")[0]);

  // ── GENDER ────────────────────────────────────────────────────────
  // Medical: "Gender\nركذ" or "Gender  Male - ذكر" or "Sex : M"
  const rawGender = firstMatch(text, [
    /Gender\s*\n\s*(Male|Female|M\b|F\b)/i,
    /Gender\s+(Male|Female)/i,
    /Sex\s*[:\n]\s*(M\b|F\b|Male|Female)/i,
    /سنجلا\s*\n?\s*(Male|Female|ركذ|ىثنأ)/,
  ]);
  if (rawGender) {
    const g = rawGender.trim().toUpperCase();
    result.gender = g === "M" || g === "MALE" || g === "ركذ" ? "Male" : "Female";
  }

  // ── OCCUPATION / PROFESSION ───────────────────────────────────────
  // eVisa structure: "Profession\n:\n:\nINVESTOR\n"
  // Medical: "Profession\nARCHITECT ENGINEER"
  const rawOcc = firstMatch(text, [
    /Profession\s*\n\s*:\s*\n\s*:?\s*\n\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n)/i,
    /Profession\s*\n\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n)/i,
    /Occupation\s*:\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n|$)/i,
    /ةنهملا\s*\n?\s*([A-Za-z][A-Za-z\s]{2,40}?)(?:\n)/,
  ]);
  if (rawOcc) {
    result.occupation = rawOcc
      .split("\n")[0]
      .trim()
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  // ── SPONSOR NAME ─────────────────────────────────────────────────
  // Extractable from:
  //   eVisa: "Employer ... Name :\nALLDELTAS FZE LLC"
  //   Trade license: "Company Name\nAllDeltas FZE LLC"
  //   Trade license v2: "Trade Name   SHAHRAZAD ABBAYAT..."
  //   Trade license v3: "Business Name   AL IEMAN LAUNDRY BR"
  // NOTE: Medical cert sponsor name is Arabic only — cannot extract

  const rawSponsor = firstMatch(text, [
    // eVisa Employer section — Name appears right after Employer block
    /(?:Employer|لمعلا بحاص)[\s\S]{0,60}?Name\s*:\s*\n\s*([A-Z][A-Z0-9\s&\-\.\/]{4,80}?)(?:\n)/i,

    // Trade license: Company Name on next line
    /Company\s+Name\s*\n\s*([A-Za-z][A-Za-z0-9\s&\-\.]{3,80}?)(?:\n)/i,

    // Trade license: Trade Name inline
    /Trade\s+Name\s+([A-Z][A-Z0-9\s&\-\.\(\)\/]{4,80}?)(?:\n|$)/i,

    // Dibba/Fujairah license: Business Name field
    /Business\s+Name\s+([A-Z][A-Z0-9\s&\-\.]{4,80}?)(?:\n|$)/i,
    /Business\s+Name\s*\n\s*([A-Za-z][A-Za-z0-9\s&\-\.]{3,80}?)(?:\n)/i,
  ]);
  if (rawSponsor) {
    // Take first line only, clean up
    result.sponsor_name = rawSponsor.split("\n")[0].trim();
  }

  // ── SPONSOR MOBILE ────────────────────────────────────────────────
  // "Tel No : 0505357525 Mob No : 0505357525"
  // "Mobile No\n0503407705"
  const rawMobile = firstMatch(text, [
    /Mob(?:ile)?\s+No\s*[:\n]+\s*(05[0-9]{8})/i,
    /Tel No\s*:\s*(05[0-9]{8})/i,
    /\b(05[0-9]{8})\b/,
  ]);
  if (rawMobile) result.sponsor_mobile = rawMobile.replace(/\s/g, "");

  // ── SPONSOR EMAIL ─────────────────────────────────────────────────
  const rawEmail = firstMatch(text, [
    /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,
  ]);
  if (rawEmail) result.sponsor_email = rawEmail;

  // ── TRADE LICENSE NUMBER ──────────────────────────────────────────
  // Trade license: "License Number\n2624811332888"
  // Dibba license: "License Number   03913"
  const rawLicense = firstMatch(text, [
    /License Number\s*\n\s*([A-Z0-9]{4,20})/i,
    /License Number\s+([A-Z0-9]{4,20})/i,
    /رقم الرخصة\s*\n?\s*([A-Z0-9]{4,20})/,
    /ةصخرلا مقر\s*\n?\s*([A-Z0-9]{4,20})/,
  ]);
  if (rawLicense) result.trade_license_no = rawLicense.trim();

  // ── COMPANY / SPONSOR NAME (from trade license) ───────────────────
  // "Company Name\nAllDeltas FZE LLC\n\nManager"
  // "Business Name   AL IEMAN LAUNDRY BR"
  if (!result.sponsor_name) {
    const rawCompany = firstMatch(text, [
      /(?:Company Name|Business\s+Name)\s*\n\s*([A-Za-z][A-Za-z0-9\s&\-\.]{3,80}?)(?:\n)/i,
      /(?:Company Name|Business\s+Name)\s+([A-Z][A-Z0-9\s&\-\.]{3,60}?)(?:\n|$)/i,
    ]);
    if (rawCompany) result.sponsor_name = rawCompany.split("\n")[0].trim();
  }

  return result;
}

