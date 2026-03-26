import { NextResponse } from "next/server";

export const runtime = "nodejs";

type PingRow = {
  key: string;
  baseUrl: string | undefined;
  skipped: boolean;
  ok?: boolean;
  status?: number;
  ms?: number;
  error?: string;
};

async function tryPing(base: string, pathSuffix: string): Promise<{ ok: boolean; status?: number; ms: number; error?: string }> {
  const root = base.replace(/\/$/, "");
  const url = pathSuffix ? `${root}${pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`}` : root;
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { method: "GET", signal: ctrl.signal });
    clearTimeout(tid);
    return { ok: r.ok, status: r.status, ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET() {
  const targets: { key: string; env: string }[] = [
    { key: "icp", env: "ICP_API_BASE_URL" },
    { key: "insurer", env: "INSURER_API_BASE_URL" },
    { key: "tpa", env: "TPA_API_BASE_URL" },
    { key: "payment", env: "PAYMENT_GATEWAY_BASE_URL" },
  ];

  const rows: PingRow[] = [];
  for (const t of targets) {
    const baseUrl = process.env[t.env]?.trim();
    if (!baseUrl) {
      rows.push({ key: t.key, baseUrl: undefined, skipped: true });
      continue;
    }
    let r = await tryPing(baseUrl, "/health");
    if (!r.ok) {
      r = await tryPing(baseUrl, "");
    }
    rows.push({
      key: t.key,
      baseUrl,
      skipped: false,
      ok: r.ok,
      status: r.status,
      ms: r.ms,
      error: r.error,
    });
  }

  return NextResponse.json({
    ok: true,
    note: "Best-effort HTTP GET; does not authenticate. Use for connectivity smoke tests only.",
    results: rows,
  });
}
