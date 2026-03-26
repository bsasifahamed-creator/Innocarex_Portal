/**
 * Integration Layer (SOW §3) — Modules 6–8 and 11.
 * Env vars are presence-checked only — never expose values to the client.
 */

export type IntegrationId = "icp" | "insurer" | "tpa" | "payment";

export type IntegrationContract = {
  id: IntegrationId;
  sowModuleIds: number[];
  displayName: string;
  /** Env keys that must be non-empty for "configured" status */
  requiredEnvKeys: string[];
  optionalEnvKeys: string[];
  description: string;
};

export const INTEGRATION_CONTRACTS: IntegrationContract[] = [
  {
    id: "icp",
    sowModuleIds: [6],
    displayName: "ICP (Insurance Authority)",
    requiredEnvKeys: ["ICP_API_BASE_URL", "ICP_CLIENT_ID", "ICP_CLIENT_SECRET"],
    optionalEnvKeys: ["ICP_WEBHOOK_SECRET"],
    description:
      "Emirates ID and visa verification, residency validation, and policy linkage to visa applications per ICP / government interfaces.",
  },
  {
    id: "insurer",
    sowModuleIds: [7],
    displayName: "Insurer APIs",
    requiredEnvKeys: ["INSURER_API_BASE_URL", "INSURER_API_KEY"],
    optionalEnvKeys: ["INSURER_WEBHOOK_SECRET"],
    description:
      "Quote API, proposal submission, policy issuance, policy status, and renewal APIs for each participating insurer.",
  },
  {
    id: "tpa",
    sowModuleIds: [8],
    displayName: "TPA",
    requiredEnvKeys: ["TPA_API_BASE_URL", "TPA_CLIENT_ID", "TPA_CLIENT_SECRET"],
    optionalEnvKeys: [],
    description: "Transmit member data, policy details, network details, and coverage limits to TPAs.",
  },
  {
    id: "payment",
    sowModuleIds: [11],
    displayName: "Payment gateway",
    requiredEnvKeys: ["PAYMENT_GATEWAY_MERCHANT_ID", "PAYMENT_GATEWAY_API_KEY", "PAYMENT_GATEWAY_BASE_URL"],
    optionalEnvKeys: ["PAYMENT_WEBHOOK_SECRET"],
    description:
      "Card payments, bank transfers, corporate invoicing; payment confirmation must trigger policy issuance in production.",
  },
];

export function isIntegrationConfigured(contract: IntegrationContract, env: NodeJS.ProcessEnv): boolean {
  return contract.requiredEnvKeys.every((k) => {
    const v = env[k];
    return typeof v === "string" && v.trim().length > 0;
  });
}
