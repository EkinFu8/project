import "../load-env-pre.js";
import { prisma } from "../src/lib/prisma";
import { DEMO_ADMIN_EMAIL, DEMO_USER_EMAIL, ensureDemoAuthAndProfiles } from "./ensure-demo-users";

type SeedTemplate = {
  filename: string;
  url: string;
  content_type: "Reference" | "Workflow";
  document_status: "Created" | "in-progress" | "Finalized" | "Archived";
  last_modified: Date;
};

type Persona = "underwriter" | "business-analyst" | "actuarial-analyst" | "exl-operations";

const STATUSES: SeedTemplate["document_status"][] = [
  "Finalized",
  "Created",
  "in-progress",
  "Finalized",
  "Archived",
];

function addDays(base: string, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function buildTemplates(persona: Persona, names: string[]): SeedTemplate[] {
  return names.map((filename, index) => ({
    filename,
    url: `https://example.com/${persona}/${filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`,
    content_type: index % 3 === 0 ? "Workflow" : "Reference",
    document_status: STATUSES[index % STATUSES.length],
    last_modified: addDays("2026-04-01", index),
  }));
}

function buildPersonaContent(
  persona: Persona,
  templates: SeedTemplate[],
  ownerIds: [string, string],
) {
  return templates.map((template, index) => ({
    fileID:
      `${persona.toUpperCase().replace(/-/g, "_")}_${String(index + 1).padStart(2, "0")}`.slice(
        0,
        64,
      ),
    owner_id: ownerIds[index % ownerIds.length],
    job_position: persona,
    expiration_date: addDays("2026-05-15", index * 4),
    next_review_date: addDays("2026-04-20", index * 3),
    ...template,
  }));
}

async function main() {
  console.log("Seeding database...");

  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'content_management'
    ) AS exists
  `;
  if (!rows[0]?.exists) {
    console.error(
      "Missing table public.content_management. Apply Supabase migrations first, e.g. from repo root:\n" +
        "  pnpm db:start   # if local stack is not running\n" +
        "  pnpm db:reset   # migrations + supabase/seed.sql (demo Auth users)\n" +
        "Then ensure DATABASE_URL matches local Postgres (see .env.example).",
    );
    process.exit(1);
  }

  await ensureDemoAuthAndProfiles(prisma);

  await prisma.contentManagement.deleteMany();

  const userRow = await prisma.userProfile.findFirst({
    where: { email: DEMO_USER_EMAIL },
  });
  const adminRow = await prisma.userProfile.findFirst({
    where: { email: DEMO_ADMIN_EMAIL },
  });

  if (!userRow || !adminRow) {
    throw new Error(
      `Demo profiles missing after ensureDemoAuthAndProfiles (${DEMO_ADMIN_EMAIL}, ${DEMO_USER_EMAIL}).`,
    );
  }

  const actuarialTemplates: SeedTemplate[] = [
    {
      filename: "Actuarial Pricing Workbook",
      url: "https://file-examples.com/wp-content/storage/2017/02/file_example_XLSX_10.xlsx",
      content_type: "Workflow",
      document_status: "Finalized",
      last_modified: new Date("2026-04-01"),
    },
    {
      filename: "Loss Trend Analysis Guide",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-02"),
    },
    {
      filename: "Reserve Adequacy Checklist",
      url: "https://example.com/actuarial/reserve-checklist",
      content_type: "Workflow",
      document_status: "Created",
      last_modified: new Date("2026-04-03"),
    },
    {
      filename: "Catastrophe Scenario Notes",
      url: "https://example.com/actuarial/cat-scenarios",
      content_type: "Reference",
      document_status: "in-progress",
      last_modified: new Date("2026-04-04"),
    },
    {
      filename: "Quarterly Rate Review Slides",
      url: "https://file-examples.com/wp-content/storage/2017/02/file_example_PPT_500kB.ppt",
      content_type: "Workflow",
      document_status: "Finalized",
      last_modified: new Date("2026-04-05"),
    },
    {
      filename: "Exposure Forecast Summary",
      url: "https://example.com/actuarial/exposure-forecast",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-06"),
    },
    {
      filename: "Claim Frequency Assumptions",
      url: "https://example.com/actuarial/frequency-assumptions",
      content_type: "Reference",
      document_status: "Created",
      last_modified: new Date("2026-04-07"),
    },
    {
      filename: "Severity Calibration Notes",
      url: "https://example.com/actuarial/severity-calibration",
      content_type: "Workflow",
      document_status: "in-progress",
      last_modified: new Date("2026-04-08"),
    },
    {
      filename: "Territory Relativity Memo",
      url: "https://example.com/actuarial/territory-relativity",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-09"),
    },
    {
      filename: "Reinsurance Attachment Summary",
      url: "https://example.com/actuarial/reinsurance-attachment",
      content_type: "Reference",
      document_status: "Archived",
      last_modified: new Date("2026-04-10"),
    },
    {
      filename: "Profitability Trend Dashboard Spec",
      url: "https://example.com/actuarial/profitability-dashboard",
      content_type: "Workflow",
      document_status: "Finalized",
      last_modified: new Date("2026-04-11"),
    },
    {
      filename: "Actuarial Model Validation Doc",
      url: "https://file-examples.com/wp-content/storage/2017/10/file-sample_150kB.pdf",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-12"),
    },
    {
      filename: "Premium Indication Template",
      url: "https://example.com/actuarial/premium-indication-template",
      content_type: "Workflow",
      document_status: "Created",
      last_modified: new Date("2026-04-13"),
    },
    {
      filename: "Rate Filing Submission Tracker",
      url: "https://example.com/actuarial/rate-filing-tracker",
      content_type: "Workflow",
      document_status: "in-progress",
      last_modified: new Date("2026-04-14"),
    },
    {
      filename: "Actuarial Reference Image",
      url: "https://file-examples.com/wp-content/storage/2017/10/file_example_JPG_100kB.jpg",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-15"),
    },
  ];

  const exlTemplates: SeedTemplate[] = [
    {
      filename: "EXL Intake Workflow",
      url: "https://example.com/exl/intake-workflow",
      content_type: "Workflow",
      document_status: "Finalized",
      last_modified: new Date("2026-04-01"),
    },
    {
      filename: "Vendor SLA Summary",
      url: "https://example.com/exl/vendor-sla-summary",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-02"),
    },
    {
      filename: "Backlog Prioritization Board",
      url: "https://example.com/exl/backlog-prioritization",
      content_type: "Workflow",
      document_status: "Created",
      last_modified: new Date("2026-04-03"),
    },
    {
      filename: "Data Handoff Checklist",
      url: "https://example.com/exl/data-handoff-checklist",
      content_type: "Workflow",
      document_status: "in-progress",
      last_modified: new Date("2026-04-04"),
    },
    {
      filename: "Operational Metrics Slides",
      url: "https://file-examples.com/wp-content/storage/2017/02/file_example_PPT_500kB.ppt",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-05"),
    },
    {
      filename: "Escalation Routing Matrix",
      url: "https://example.com/exl/escalation-routing",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-06"),
    },
    {
      filename: "Quality Review Playbook",
      url: "https://example.com/exl/quality-review-playbook",
      content_type: "Reference",
      document_status: "Created",
      last_modified: new Date("2026-04-07"),
    },
    {
      filename: "Case Assignment Rules",
      url: "https://example.com/exl/case-assignment-rules",
      content_type: "Workflow",
      document_status: "Finalized",
      last_modified: new Date("2026-04-08"),
    },
    {
      filename: "Turnaround Time Targets",
      url: "https://example.com/exl/turnaround-targets",
      content_type: "Reference",
      document_status: "in-progress",
      last_modified: new Date("2026-04-09"),
    },
    {
      filename: "Queue Monitoring Workbook",
      url: "https://file-examples.com/wp-content/storage/2017/02/file_example_XLSX_10.xlsx",
      content_type: "Workflow",
      document_status: "Finalized",
      last_modified: new Date("2026-04-10"),
    },
    {
      filename: "Resource Planning Template",
      url: "https://example.com/exl/resource-planning",
      content_type: "Workflow",
      document_status: "Archived",
      last_modified: new Date("2026-04-11"),
    },
    {
      filename: "Audit Readiness Notes",
      url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-12"),
    },
    {
      filename: "Service Recovery Guide",
      url: "https://example.com/exl/service-recovery-guide",
      content_type: "Reference",
      document_status: "Created",
      last_modified: new Date("2026-04-13"),
    },
    {
      filename: "Knowledge Transfer Recording",
      url: "https://example.com/exl/knowledge-transfer-recording",
      content_type: "Workflow",
      document_status: "in-progress",
      last_modified: new Date("2026-04-14"),
    },
    {
      filename: "Operations Reference Image",
      url: "https://file-examples.com/wp-content/storage/2017/10/file_example_PNG_500kB.png",
      content_type: "Reference",
      document_status: "Finalized",
      last_modified: new Date("2026-04-15"),
    },
  ];

  const underwriterTemplates = buildTemplates("underwriter", [
    "Underwriting Authority Matrix",
    "Risk Review Checklist",
    "Submission Intake Playbook",
    "Broker Communication Guide",
    "Policy Endorsement Workflow",
    "Renewal Review Standards",
    "Loss Run Analysis Notes",
    "Coverage Exception Reference",
    "Premium Change Approval Flow",
    "Underwriter Quality Audit Guide",
    "Binding Approval Checklist",
    "Referral Escalation Matrix",
  ]);

  const businessAnalystTemplates = buildTemplates("business-analyst", [
    "Requirements Intake Template",
    "Stakeholder Interview Guide",
    "Process Mapping Standards",
    "Release Readiness Checklist",
    "User Acceptance Test Plan",
    "Dashboard Metrics Dictionary",
    "Data Quality Review Notes",
    "Change Request Workflow",
    "Persona Research Summary",
    "Backlog Grooming Playbook",
    "Business Rules Catalog",
    "Feature Traceability Matrix",
  ]);

  const legacyContent = [
    {
      fileID: "FILE-TS-GUIDE-001",
      filename: "Getting Started with TypeScript",
      url: "/docs/typescript-guide",
      owner_id: userRow.id,
      job_position: "underwriter",
      last_modified: new Date("2026-03-15"),
      content_type: "Reference" as const,
      document_status: "Finalized" as const,
    },
    {
      fileID: "FILE-MKT-Q1-002",
      filename: "Q1 Marketing Strategy",
      url: "/docs/q1-marketing",
      owner_id: adminRow.id,
      job_position: "business-analyst",
      last_modified: new Date("2026-02-20"),
      content_type: "Workflow" as const,
      document_status: "Finalized" as const,
    },
    {
      fileID: "FILE-ARCH-MICRO-003",
      filename: "Microservices Architecture Guide",
      url: "/docs/microservices",
      owner_id: userRow.id,
      job_position: "underwriter",
      last_modified: new Date("2026-01-10"),
      content_type: "Reference" as const,
      document_status: "Finalized" as const,
    },
    {
      fileID: "FILE-DS-V2-004",
      filename: "Design System v2 Proposal",
      url: "/docs/design-system-v2",
      owner_id: adminRow.id,
      job_position: "business-analyst",
      last_modified: new Date("2026-03-28"),
      content_type: "Reference" as const,
      document_status: "Created" as const,
    },
    {
      fileID: "FILE-ROADMAP-2026-005",
      filename: "Product Roadmap 2026",
      url: "/docs/roadmap-2026",
      owner_id: userRow.id,
      job_position: "underwriter",
      last_modified: new Date("2026-03-01"),
      content_type: "Workflow" as const,
      document_status: "in-progress" as const,
    },
  ];

  const personaContent = [
    ...buildPersonaContent("underwriter", underwriterTemplates, [userRow.id, adminRow.id]),
    ...buildPersonaContent("business-analyst", businessAnalystTemplates, [adminRow.id, userRow.id]),
    ...buildPersonaContent("actuarial-analyst", actuarialTemplates, [adminRow.id, userRow.id]),
    ...buildPersonaContent("exl-operations", exlTemplates, [userRow.id, adminRow.id]),
  ];

  await prisma.contentManagement.createMany({
    data: [...legacyContent, ...personaContent],
  });

  console.log(
    `Seeded ${legacyContent.length + personaContent.length} content items with at least 10 documents for each Iteration 4 persona.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
