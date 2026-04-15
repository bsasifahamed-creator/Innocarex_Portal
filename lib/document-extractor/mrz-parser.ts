import type { ExtractedData } from "./index";

// Nationality code → country name map
const NAT_MAP: Record<string, string> = {
  ETH: "Ethiopia",
  IND: "India",
  PHL: "Philippines",
  NPL: "Nepal",
  LKA: "Sri Lanka",
  PAK: "Pakistan",
  BGD: "Bangladesh",
  EGY: "Egypt",
  DEU: "Germany",
  SYR: "Syria",
  PSE: "Palestine",
  BDI: "Burundi",
  IDN: "Indonesia",
  ARE: "United Arab Emirates",
  JOR: "Jordan",
  LBN: "Lebanon",
  SDN: "Sudan",
  NGA: "Nigeria",
  KEN: "Kenya",
  GHA: "Ghana",
  CHN: "China",
};

function yy2yyyy(yy: number): string {
  return yy > 30 ? `19${String(yy).padStart(2, "0")}` : `20${String(yy).padStart(2, "0")}`;
}

function parseDOB(yymmdd: string): string {
  if (yymmdd.length !== 6) return "";
  const yy = parseInt(yymmdd.slice(0, 2));
  const mm = yymmdd.slice(2, 4);
  const dd = yymmdd.slice(4, 6);
  return `${dd}/${mm}/${yy2yyyy(yy)}`;
}

function splitGivenName(raw: string): { first_name: string; middle_name: string } {
  const parts = raw.split("<").filter(Boolean);
  return {
    first_name: parts[0] ?? "",
    middle_name: parts.slice(1).join(" "),
  };
}

/**
 * Find MRZ lines in OCR text.
 * EID (TD1): 3 lines of ~30 chars each — look for ILARE prefix.
 * Passport (TD3): 2 lines of ~44 chars each — look for P< prefix.
 */
export function parseMRZFromText(text: string): Partial<ExtractedData> {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result: Partial<ExtractedData> = {};

  // ── Try TD3 Passport MRZ (2 lines) ──
  const td3Line1Idx = lines.findIndex((l) => /^P<[A-Z]{3}[A-Z<]{5,}/.test(l) && l.length >= 40);
  if (td3Line1Idx >= 0 && td3Line1Idx + 1 < lines.length) {
    const l1 = lines[td3Line1Idx];
    const l2 = lines[td3Line1Idx + 1];

    if (/^[A-Z0-9<]{30,}/.test(l2)) {
      // Parse line 1: P<COUNTRY SURNAME<<GIVEN
      const nameSection = l1.slice(5); // skip P<XXX
      const [surnameRaw, givenRaw] = nameSection.split("<<");
      if (surnameRaw) {
        result.last_name = surnameRaw.replace(/</g, " ").trim();
        if (givenRaw) {
          const { first_name, middle_name } = splitGivenName(givenRaw);
          result.first_name = first_name;
          result.middle_name = middle_name;
        }
      }

      // Parse line 2 (best-effort by fixed positions)
      const passportNo = l2.slice(0, 9).replace(/</g, "").trim();
      if (passportNo) result.passport_no = passportNo;

      // Nationality code: 3 letters at index 10..13 (after passport number + check digit)
      const natCode = l2.slice(10, 13);
      if (natCode) result.nationality = NAT_MAP[natCode] ?? "";

      const dob = parseDOB(l2.slice(13, 19));
      if (dob) result.dob = dob;

      // Sex at position 20
      const sex = l2[20];
      if (sex === "M") result.gender = "Male";
      if (sex === "F") result.gender = "Female";

      return result;
    }
  }

  // ── Try TD1 EID MRZ (3 lines) ──
  const td1LineIdx = lines.findIndex((l) => l.startsWith("ILARE") && l.length >= 25);
  if (td1LineIdx >= 0) {
    const l1 = lines[td1LineIdx];

    // Line 1 contains: ILARE + card_no + eid_no + dob + sex + expiry (best-effort)
    const eidDigits = l1.slice(5, 20).replace(/[^0-9]/g, "");
    if (eidDigits.length === 15) {
      result.member_emirates_id = `${eidDigits.slice(0, 3)}-${eidDigits.slice(3, 7)}-${eidDigits.slice(7, 14)}-${eidDigits.slice(14)}`;
    }

    const dobMatch = l1.match(/(\d{6})[MF]/);
    if (dobMatch?.[1]) {
      result.dob = parseDOB(dobMatch[1]);
      const idx = l1.indexOf(dobMatch[0]) + dobMatch[0].length - 1;
      const sex = l1[idx];
      if (sex === "M") result.gender = "Male";
      if (sex === "F") result.gender = "Female";
    }

    const natMatch = l1.match(/[MF](\d{6})[A-Z]{3}/);
    if (natMatch?.[0]) {
      // last 3 chars are the nationality code
      const code = natMatch[0].slice(-3);
      result.nationality = NAT_MAP[code] ?? "";
    }

    // Name line: last line with << pattern after td1LineIdx
    const nameLine = lines.slice(td1LineIdx).find((l) => l.includes("<<"));
    if (nameLine) {
      const [surnameRaw, givenRaw] = nameLine.split("<<");
      if (surnameRaw) {
        result.last_name = surnameRaw.replace(/</g, " ").trim();
        if (givenRaw) {
          const { first_name, middle_name } = splitGivenName(givenRaw);
          result.first_name = first_name;
          result.middle_name = middle_name;
        }
      }
    }
  }

  return result;
}

