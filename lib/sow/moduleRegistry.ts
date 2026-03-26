/**
 * Unified Digital Insurance Distribution & Policy Issuance Portal – UAE (SOW §4, §7).
 * Phases follow SOW Implementation Phases exactly.
 * `implementation`: what exists in this repo today vs full SOW.
 */

export type SowImplementation = "stub" | "partial" | "live";

export type SowPhaseId = 1 | 2 | 3 | 4;

export type SowPhaseMeta = {
  id: SowPhaseId;
  title: string;
  sowSummary: string;
};

/** SOW §7 – Implementation Phases */
export const SOW_PHASES: SowPhaseMeta[] = [
  {
    id: 1,
    title: "Phase 1 – Core Portal",
    sowSummary: "User management; Broker portal; Plan comparison; Quote engine",
  },
  {
    id: 2,
    title: "Phase 2 – Policy Issuance",
    sowSummary: "Typing center portal; Payment gateway; Document management",
  },
  {
    id: 3,
    title: "Phase 3 – Integrations",
    sowSummary: "Insurer APIs; TPA APIs; ICP integration",
  },
  {
    id: 4,
    title: "Phase 4 – Advanced Capabilities",
    sowSummary: "Commission automation; Analytics dashboards; AI-based policy recommendation",
  },
];

export type SowModule = {
  id: number;
  /** Exact-style name from SOW §4 */
  name: string;
  route: string | null;
  phase: SowPhaseId;
  implementation: SowImplementation;
  /** SOW acceptance criteria (bullets) */
  criteria: string[];
  /** Gap vs SOW in current codebase */
  gapNotes: string;
};

export const SOW_MODULES: SowModule[] = [
  {
    id: 1,
    name: "Module 1 – User Management",
    route: "/portal/admin/users",
    phase: 1,
    implementation: "stub",
    criteria: [
      "User registration and onboarding",
      "Role-based access control",
      "Multi-level approval workflows",
      "Audit logs",
    ],
    gapNotes: "Demo JWT login only; no registration, RBAC matrix, approvals, or audit store.",
  },
  {
    id: 2,
    name: "Module 2 – Broker & Affiliate Portal",
    route: "/portal/broker",
    phase: 1,
    implementation: "partial",
    criteria: [
      "Broker dashboard",
      "Plan comparison",
      "Quote generation",
      "Client management",
      "Policy issuance tracking",
      "Commission visibility",
    ],
    gapNotes: "Quote + partial issuance demo; no client CRM, tracking DB, or live commission data.",
  },
  {
    id: 3,
    name: "Module 3 – Insurance Plan Marketplace",
    route: "/portal/marketplace",
    phase: 1,
    implementation: "stub",
    criteria: [
      "Central repository of insurance plans",
      "Coverage limits, deductibles, co-pay structure",
      "Premium and eligibility rules",
      "Plan comparison features",
    ],
    gapNotes: "No central catalogue from insurers; comparison is only via mock quote results.",
  },
  {
    id: 4,
    name: "Module 4 – Quotation Engine",
    route: "/portal/broker/quote",
    phase: 1,
    implementation: "partial",
    criteria: [
      "Inputs: age, gender, nationality, visa category, emirate, salary band",
      "Outputs: available insurers, premium pricing, plan comparison",
    ],
    gapNotes: "Inputs match SOW; outputs are mock insurers/premiums until M7 live APIs.",
  },
  {
    id: 5,
    name: "Module 5 – Policy Issuance Portal (Typing Centres)",
    route: "/portal/typing/issuance",
    phase: 2,
    implementation: "partial",
    criteria: [
      "Customer onboarding",
      "Document upload",
      "Emirates ID and passport capture",
      "Proposal submission",
    ],
    gapNotes: "Workflow shell + document intake; no persisted proposals or insurer submission.",
  },
  {
    id: 6,
    name: "Module 6 – ICP Integration",
    route: "/portal/integrations/icp",
    phase: 3,
    implementation: "stub",
    criteria: [
      "Emirates ID verification",
      "Visa status verification",
      "Residency validation",
      "Policy linking to visa application",
    ],
    gapNotes: "Env/contract readiness only; no government system calls.",
  },
  {
    id: 7,
    name: "Module 7 – Insurer API Integration",
    route: "/portal/integrations/insurer",
    phase: 3,
    implementation: "stub",
    criteria: [
      "Quote API",
      "Proposal submission",
      "Policy issuance",
      "Policy status check",
      "Renewal API",
    ],
    gapNotes: "No insurer connectivity; quotation/issue APIs are in-app mocks.",
  },
  {
    id: 8,
    name: "Module 8 – TPA Integration",
    route: "/portal/integrations/tpa",
    phase: 3,
    implementation: "stub",
    criteria: [
      "Member data transmission",
      "Policy details",
      "Network details",
      "Coverage limits",
    ],
    gapNotes: "Contract placeholder only.",
  },
  {
    id: 9,
    name: "Module 9 – Member Enrollment System",
    route: "/portal/member-enrollment",
    phase: 2,
    implementation: "stub",
    criteria: [
      "Validation of member data",
      "Upload to insurer systems",
      "Policy activation",
      "Member ID and policy number generation",
    ],
    gapNotes: "Demo policy numbers on issue only; no insurer upload or activation pipeline.",
  },
  {
    id: 10,
    name: "Module 10 – Digital Health Insurance Card",
    route: "/portal/digital-card",
    phase: 2,
    implementation: "partial",
    criteria: [
      "Digital e-card generation",
      "Downloadable PDF",
      "Mobile wallet compatible version",
    ],
    gapNotes: "PDF e-card/certificate from quote flow; no Apple/Google Wallet pass yet.",
  },
  {
    id: 11,
    name: "Module 11 – Payment Gateway",
    route: "/portal/payments",
    phase: 2,
    implementation: "stub",
    criteria: [
      "Credit/Debit card payments",
      "Bank transfers",
      "Corporate invoicing",
      "Payment confirmation triggers policy issuance",
    ],
    gapNotes: "No gateway integration; issuance does not wait on payment.",
  },
  {
    id: 12,
    name: "Module 12 – Commission Management",
    route: "/portal/commission",
    phase: 4,
    implementation: "stub",
    criteria: [
      "Broker commission calculation",
      "Affiliate commission",
      "Typing centre service fee",
      "Commission reports and payout tracking",
    ],
    gapNotes: "Not implemented.",
  },
  {
    id: 13,
    name: "Module 13 – Document Management",
    route: "/portal/typing/documents",
    phase: 2,
    implementation: "partial",
    criteria: ["Secure document storage", "OCR extraction", "Version tracking"],
    gapNotes: "OCR/intake only; no encrypted vault or document versioning.",
  },
  {
    id: 14,
    name: "Module 14 – Operations Dashboard",
    route: "/portal/operations",
    phase: 4,
    implementation: "stub",
    criteria: [
      "Policies issued",
      "Quotes generated",
      "Revenue tracking",
      "Pending approvals",
    ],
    gapNotes: "Placeholder tiles; no metrics backend.",
  },
  {
    id: 15,
    name: "Module 15 – Analytics & Reporting",
    route: "/portal/analytics",
    phase: 4,
    implementation: "stub",
    criteria: [
      "Sales reports (policies by broker, revenue by insurer)",
      "Operational reports (pending policies, issuance turnaround)",
      "Compliance reports (ICP linkage, regulatory audit logs)",
    ],
    gapNotes: "No reporting engine or data warehouse.",
  },
];

export function modulesByPhase(phase: SowPhaseId) {
  return SOW_MODULES.filter((m) => m.phase === phase);
}

export function moduleById(id: number): SowModule | undefined {
  return SOW_MODULES.find((m) => m.id === id);
}
