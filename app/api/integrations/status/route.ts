import { NextResponse } from "next/server";
import { INTEGRATION_CONTRACTS, isIntegrationConfigured } from "@/lib/integrations/contracts";

/**
 * Returns which integrations have required env vars set (boolean only).
 * Does not leak secret values.
 */
export async function GET() {
  const integrations = INTEGRATION_CONTRACTS.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    sowModuleIds: c.sowModuleIds,
    configured: isIntegrationConfigured(c, process.env),
    requiredKeysPresent: Object.fromEntries(
      c.requiredEnvKeys.map((k) => [k, Boolean(process.env[k]?.trim())]),
    ),
  }));

  return NextResponse.json({
    ok: true,
    environment: process.env.NODE_ENV,
    integrations,
    note: "configured only means env vars are set; adapters are not verified at runtime.",
  });
}
