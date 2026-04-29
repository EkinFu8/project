import "../load-env-pre.js";
import { prisma } from "../src/lib/prisma";

const PASSWORD = "HanoverTest123!";

const demoUsers = [
  {
    id: "b0000001-0000-4000-8000-000000000001",
    email: "olivia.reed@hanover.test",
    name: "Olivia Reed",
    portal: "employee",
    role: "underwriter",
    employee_code: "EMP201",
    job_desc: "Senior Commercial Underwriter",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop",
  },
  {
    id: "b0000002-0000-4000-8000-000000000002",
    email: "marcus.chen@hanover.test",
    name: "Marcus Chen",
    portal: "employee",
    role: "business-analyst",
    employee_code: "EMP202",
    job_desc: "Business Analyst",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop",
  },
  {
    id: "b0000003-0000-4000-8000-000000000003",
    email: "priya.narayan@hanover.test",
    name: "Priya Narayan",
    portal: "employee",
    role: "actuarial-analyst",
    employee_code: "EMP203",
    job_desc: "Actuarial Analyst",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&h=240&fit=crop",
  },
  {
    id: "b0000004-0000-4000-8000-000000000004",
    email: "james.miller@hanover.test",
    name: "James Miller",
    portal: "employee",
    role: "exl-operations",
    employee_code: "EMP204",
    job_desc: "Operations Lead",
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&h=240&fit=crop",
  },
  {
    id: "b0000005-0000-4000-8000-000000000005",
    email: "sophia.martinez@hanover.test",
    name: "Sophia Martinez",
    portal: "employee",
    role: "underwriter",
    employee_code: "EMP205",
    job_desc: "Claims Reviewer",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&h=240&fit=crop",
  },
  {
    id: "b0000006-0000-4000-8000-000000000006",
    email: "ethan.parker@hanover.test",
    name: "Ethan Parker",
    portal: "employee",
    role: "business-analyst",
    employee_code: "EMP206",
    job_desc: "Risk Manager",
    photo_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&h=240&fit=crop",
  },
  {
    id: "b0000007-0000-4000-8000-000000000007",
    email: "nina.williams@hanover.test",
    name: "Nina Williams",
    portal: "admin",
    role: "admin",
    employee_code: "ADM201",
    job_desc: "Content Governance Admin",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop",
  },
  {
    id: "b0000008-0000-4000-8000-000000000008",
    email: "david.kim@hanover.test",
    name: "David Kim",
    portal: "employee",
    role: "underwriter",
    employee_code: "EMP207",
    job_desc: "Middle Market Underwriter",
    photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop",
  },
] as const;

const tags = [
  ["Policy", "#2563eb"],
  ["Training", "#16a34a"],
  ["Urgent", "#dc2626"],
  ["Compliance", "#9333ea"],
  ["Pricing", "#f59e0b"],
  ["Operations", "#0891b2"],
  ["Claims", "#ea580c"],
  ["Renewal", "#0f766e"],
  ["Reference", "#64748b"],
  ["Leadership", "#be123c"],
] as const;

const content = [
  [
    "DEMO-RICH-UW-001",
    "Commercial Auto Renewal Playbook.pdf",
    "underwriter",
    "Workflow",
    "Finalized",
    "pdf",
    "Policy,Renewal,Training",
  ],
  [
    "DEMO-RICH-UW-002",
    "Middle Market Appetite Guide.docx",
    "underwriter",
    "Reference",
    "Finalized",
    "docx",
    "Policy,Reference",
  ],
  [
    "DEMO-RICH-UW-003",
    "Umbrella Capacity Checklist.xlsx",
    "underwriter",
    "Workflow",
    "in-progress",
    "xlsx",
    "Compliance,Renewal",
  ],
  [
    "DEMO-RICH-UW-004",
    "New Business Intake SOP.pdf",
    "underwriter",
    "Workflow",
    "Created",
    "pdf",
    "Training,Operations",
  ],
  [
    "DEMO-RICH-UW-005",
    "Property Inspection Red Flags.png",
    "underwriter",
    "Reference",
    "Finalized",
    "png",
    "Urgent,Reference",
  ],
  [
    "DEMO-RICH-UW-006",
    "Broker Submission Quality Scorecard.xlsx",
    "underwriter",
    "Workflow",
    "Finalized",
    "xlsx",
    "Operations,Pricing",
  ],
  [
    "DEMO-RICH-BA-001",
    "Executive KPI Dashboard Requirements.xlsx",
    "business-analyst",
    "Workflow",
    "Finalized",
    "xlsx",
    "Leadership,Operations",
  ],
  [
    "DEMO-RICH-BA-002",
    "Content Taxonomy Gap Analysis.pdf",
    "business-analyst",
    "Reference",
    "in-progress",
    "pdf",
    "Compliance,Reference",
  ],
  [
    "DEMO-RICH-BA-003",
    "Producer Portal Journey Map.pdf",
    "business-analyst",
    "Reference",
    "Created",
    "pdf",
    "Training,Operations",
  ],
  [
    "DEMO-RICH-BA-004",
    "Workflow Automation Backlog.csv",
    "business-analyst",
    "Workflow",
    "Finalized",
    "csv",
    "Operations,Urgent",
  ],
  [
    "DEMO-RICH-BA-005",
    "Quarterly Adoption Readout.pptx",
    "business-analyst",
    "Reference",
    "Finalized",
    "pptx",
    "Leadership,Training",
  ],
  [
    "DEMO-RICH-BA-006",
    "Data Quality Exception Register.xlsx",
    "business-analyst",
    "Workflow",
    "Archived",
    "xlsx",
    "Compliance,Operations",
  ],
  [
    "DEMO-RICH-ACT-001",
    "Rate Indication Workbook.xlsx",
    "actuarial-analyst",
    "Workflow",
    "Finalized",
    "xlsx",
    "Pricing,Compliance",
  ],
  [
    "DEMO-RICH-ACT-002",
    "Loss Development Factor Memo.pdf",
    "actuarial-analyst",
    "Reference",
    "Finalized",
    "pdf",
    "Pricing,Reference",
  ],
  [
    "DEMO-RICH-ACT-003",
    "Territory Relativity Review.docx",
    "actuarial-analyst",
    "Workflow",
    "in-progress",
    "docx",
    "Pricing",
  ],
  [
    "DEMO-RICH-ACT-004",
    "Catastrophe Model Assumptions.pdf",
    "actuarial-analyst",
    "Reference",
    "Created",
    "pdf",
    "Urgent,Reference",
  ],
  [
    "DEMO-RICH-ACT-005",
    "Premium Leakage Analysis.xlsx",
    "actuarial-analyst",
    "Workflow",
    "Finalized",
    "xlsx",
    "Pricing,Leadership",
  ],
  [
    "DEMO-RICH-ACT-006",
    "Filing Support Exhibit Pack.pptx",
    "actuarial-analyst",
    "Reference",
    "Finalized",
    "pptx",
    "Compliance,Pricing",
  ],
  [
    "DEMO-RICH-OPS-001",
    "EXL Queue Routing Matrix.xlsx",
    "exl-operations",
    "Workflow",
    "Finalized",
    "xlsx",
    "Operations,Training",
  ],
  [
    "DEMO-RICH-OPS-002",
    "Exception Handling Playbook.pdf",
    "exl-operations",
    "Reference",
    "Finalized",
    "pdf",
    "Operations,Urgent",
  ],
  [
    "DEMO-RICH-OPS-003",
    "Daily Production Checklist.docx",
    "exl-operations",
    "Workflow",
    "in-progress",
    "docx",
    "Operations",
  ],
  [
    "DEMO-RICH-OPS-004",
    "Vendor SLA Review Notes.pdf",
    "exl-operations",
    "Reference",
    "Created",
    "pdf",
    "Compliance,Operations",
  ],
  [
    "DEMO-RICH-OPS-005",
    "Backlog Burn Down Tracker.xlsx",
    "exl-operations",
    "Workflow",
    "Finalized",
    "xlsx",
    "Leadership,Operations",
  ],
  [
    "DEMO-RICH-OPS-006",
    "Knowledge Transfer Plan.docx",
    "exl-operations",
    "Workflow",
    "Archived",
    "docx",
    "Training,Reference",
  ],
  [
    "DEMO-RICH-CLM-001",
    "Claims Escalation Review.pdf",
    "underwriter",
    "Workflow",
    "Finalized",
    "pdf",
    "Claims,Urgent",
  ],
  [
    "DEMO-RICH-CLM-002",
    "Subrogation Intake Guide.docx",
    "underwriter",
    "Reference",
    "Finalized",
    "docx",
    "Claims,Training",
  ],
  [
    "DEMO-RICH-CLM-003",
    "Large Loss Reporting Template.xlsx",
    "underwriter",
    "Workflow",
    "in-progress",
    "xlsx",
    "Claims,Compliance",
  ],
  [
    "DEMO-RICH-RISK-001",
    "Risk Control Survey Checklist.pdf",
    "business-analyst",
    "Workflow",
    "Finalized",
    "pdf",
    "Policy,Compliance",
  ],
  [
    "DEMO-RICH-RISK-002",
    "Emerging Risk Watchlist.docx",
    "business-analyst",
    "Reference",
    "Created",
    "docx",
    "Leadership,Urgent",
  ],
  [
    "DEMO-RICH-RISK-003",
    "Account Stewardship Plan.xlsx",
    "business-analyst",
    "Workflow",
    "Finalized",
    "xlsx",
    "Renewal,Leadership",
  ],
] as const;

function dateDaysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function ensureAuthUsers() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  for (const user of demoUsers) {
    const metadata = JSON.stringify({
      name: user.name,
      portal: user.portal,
      role: user.role,
      employee_code: user.employee_code,
      job_desc: user.job_desc,
      photo_url: user.photo_url,
    });

    await prisma.$executeRawUnsafe(`
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  '${user.id}'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  '${user.email}',
  crypt('${PASSWORD}', gen_salt('bf')),
  NOW(),
  '', '', '', '',
  '{"provider":"email","providers":["email"]}'::jsonb,
  '${metadata.replace(/'/g, "''")}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  '${user.id}'::uuid,
  jsonb_build_object('sub', '${user.id}', 'email', '${user.email}'),
  'email',
  '${user.id}',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider_id, provider) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  user_id = EXCLUDED.user_id,
  updated_at = NOW();
`);

    await prisma.userProfile.upsert({
      where: { id: user.id },
      create: user,
      update: user,
    });
  }
}

async function main() {
  console.log(
    "[rich-demo] Adding users, content, tags, favorites, sessions, audit, and metrics...",
  );

  await ensureAuthUsers();

  const allUsers = await prisma.userProfile.findMany({
    where: {
      OR: [
        { email: { endsWith: "@hanover.test" } },
        { email: { in: ["admin@hanover.test", "user@hanover.test"] } },
      ],
    },
    orderBy: { email: "asc" },
  });

  const tagRows = new Map<string, number>();
  for (const [name, color] of tags) {
    const row = await prisma.tag.upsert({
      where: { name },
      create: { name, color },
      update: { color },
    });
    tagRows.set(name, row.id);
  }

  for (let i = 0; i < content.length; i += 1) {
    const [fileID, filename, jobPosition, contentType, status, format, tagList] = content[i];
    const owner = allUsers[i % allUsers.length];
    const checkedOutBy = i % 9 === 0 ? allUsers[(i + 2) % allUsers.length] : null;

    await prisma.contentManagement.upsert({
      where: { fileID },
      create: {
        fileID,
        filename,
        url: `https://example.com/demo/${fileID.toLowerCase()}`,
        job_position: jobPosition,
        last_modified: dateDaysFromNow(-45 + i),
        expiration_date: dateDaysFromNow(i % 5 === 0 ? -2 : 10 + i),
        next_review_date: dateDaysFromNow(i % 4 === 0 ? 7 : 30 + i),
        content_type: contentType,
        document_status: status,
        format,
        is_checked_out: Boolean(checkedOutBy),
        checked_out_by: checkedOutBy?.id ?? null,
        checked_out_at: checkedOutBy ? dateDaysFromNow(-1) : null,
        owner_id: owner?.id ?? null,
        extracted_text: `${filename} demo corpus. Includes searchable sample language for ${jobPosition}, ${contentType}, ${status}, and ${tagList}.`,
        ocr_status: i % 7 === 0 ? "processing" : i % 11 === 0 ? "failed" : "done",
        ocr_error: i % 11 === 0 ? "Demo OCR failure for UI state testing." : null,
        ocr_updated_at: dateDaysFromNow(-3),
      },
      update: {
        filename,
        url: `https://example.com/demo/${fileID.toLowerCase()}`,
        job_position: jobPosition,
        last_modified: dateDaysFromNow(-45 + i),
        expiration_date: dateDaysFromNow(i % 5 === 0 ? -2 : 10 + i),
        next_review_date: dateDaysFromNow(i % 4 === 0 ? 7 : 30 + i),
        content_type: contentType,
        document_status: status,
        format,
        is_checked_out: Boolean(checkedOutBy),
        checked_out_by: checkedOutBy?.id ?? null,
        checked_out_at: checkedOutBy ? dateDaysFromNow(-1) : null,
        owner_id: owner?.id ?? null,
        extracted_text: `${filename} demo corpus. Includes searchable sample language for ${jobPosition}, ${contentType}, ${status}, and ${tagList}.`,
        ocr_status: i % 7 === 0 ? "processing" : i % 11 === 0 ? "failed" : "done",
        ocr_error: i % 11 === 0 ? "Demo OCR failure for UI state testing." : null,
        ocr_updated_at: dateDaysFromNow(-3),
      },
    });

    for (const tagName of tagList.split(",")) {
      const tagId = tagRows.get(tagName);
      if (!tagId) continue;
      await prisma.contentTag.upsert({
        where: { fileID_tagId: { fileID, tagId } },
        create: { fileID, tagId },
        update: {},
      });
    }
  }

  for (let i = 0; i < allUsers.length; i += 1) {
    const user = allUsers[i];
    await prisma.userSession.upsert({
      where: { userId: user.id },
      create: { userId: user.id, lastSeen: dateDaysFromNow(-i) },
      update: { lastSeen: dateDaysFromNow(-i) },
    });

    for (const item of content.slice(i % 4, (i % 4) + 5)) {
      await prisma.favorite.upsert({
        where: { userId_fileID: { userId: user.id, fileID: item[0] } },
        create: { userId: user.id, fileID: item[0] },
        update: {},
      });
    }
  }

  const actions = ["upload", "edit", "download", "ownership-update"] as const;
  for (let i = 0; i < content.length; i += 1) {
    const [fileID, filename] = content[i];
    const actor = allUsers[i % allUsers.length];
    const action = actions[i % actions.length];
    await prisma.auditEvent.upsert({
      where: { id: `c000000${i % 10}-0000-4000-9000-${String(i + 1).padStart(12, "0")}` },
      create: {
        id: `c000000${i % 10}-0000-4000-9000-${String(i + 1).padStart(12, "0")}`,
        userId: actor.id,
        action,
        documentId: fileID,
        fileName: filename,
        metadata:
          action === "ownership-update"
            ? {
                oldOwnerName: allUsers[(i + 1) % allUsers.length]?.name ?? "Unassigned",
                newOwnerName: actor.name,
              }
            : { source: "rich-demo-seed", channel: i % 2 === 0 ? "web" : "api" },
        createdAt: dateDaysFromNow(-i),
      },
      update: {
        userId: actor.id,
        action,
        documentId: fileID,
        fileName: filename,
        metadata:
          action === "ownership-update"
            ? {
                oldOwnerName: allUsers[(i + 1) % allUsers.length]?.name ?? "Unassigned",
                newOwnerName: actor.name,
              }
            : { source: "rich-demo-seed", channel: i % 2 === 0 ? "web" : "api" },
        createdAt: dateDaysFromNow(-i),
      },
    });
  }

  const routes = [
    "/content.list",
    "/content.detail",
    "/notifications.myList",
    "/user.list",
    "/tag.list",
  ];
  for (let i = 0; i < 80; i += 1) {
    const user = allUsers[i % allUsers.length];
    await prisma.metricsEvent.upsert({
      where: { id: `d000000${i % 10}-0000-4000-a000-${String(i + 1).padStart(12, "0")}` },
      create: {
        id: `d000000${i % 10}-0000-4000-a000-${String(i + 1).padStart(12, "0")}`,
        route: routes[i % routes.length],
        method: i % 3 === 0 ? "POST" : "GET",
        status: i % 17 === 0 ? "500" : i % 9 === 0 ? "401" : "200",
        durationMs: 45 + ((i * 37) % 900),
        userId: user.id,
        userRole: user.role,
        createdAt: dateDaysFromNow(-Math.floor(i / 4)),
      },
      update: {
        route: routes[i % routes.length],
        method: i % 3 === 0 ? "POST" : "GET",
        status: i % 17 === 0 ? "500" : i % 9 === 0 ? "401" : "200",
        durationMs: 45 + ((i * 37) % 900),
        userId: user.id,
        userRole: user.role,
        createdAt: dateDaysFromNow(-Math.floor(i / 4)),
      },
    });
  }

  const counts = {
    users: await prisma.userProfile.count(),
    content: await prisma.contentManagement.count(),
    tags: await prisma.tag.count(),
    favorites: await prisma.favorite.count(),
    auditEvents: await prisma.auditEvent.count(),
    metricsEvents: await prisma.metricsEvent.count(),
  };

  console.log("[rich-demo] Done:", counts);
  console.log(`[rich-demo] Added login users use password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
