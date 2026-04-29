import type { AssistantToolManifest } from "./types";

export const DEFAULT_MODEL = "Phi-3.5-mini-instruct-q4f16_1-MLC";

export const CLASS_PROJECT_DISCLOSURE =
  "This website is a WPI CS 3733 Software Engineering class project and is not used by Hanover Insurance.";

export const ASSISTANT_TOOLS: AssistantToolManifest[] = [
  {
    name: "content_search",
    description:
      "Future retrieval hook for searching indexed content, document metadata, and help articles.",
    availability: "planned",
  },
  {
    name: "permission_check",
    description:
      "Future policy hook for checking whether a user can perform an action before recommending it.",
    availability: "planned",
  },
  {
    name: "admin_action_router",
    description:
      "Future controlled action hook for creating users, editing tags, and other admin-only workflows.",
    availability: "planned",
    requiresAdmin: true,
  },
];

export const APP_GUIDE = `
Product
- iBank is a content management app for employee-facing insurance documents.
- The assistant is advisory only. It cannot perform writes, read private records, bypass permissions, or verify server state.

Roles and permissions
- admin: can manage users, content, tags, dashboard metrics, and audit views.
- underwriter, actuarial-analyst, business-analyst, exl-operations: can view and download permitted content.
- Non-admin users can create content only for their assigned role.
- Non-admin users can only check out and modify content assigned to their own role.
- Content checked out by another user cannot be modified until released.
- Only admins should create, edit, or delete global meta tags.
- Only admins should create, edit, or delete users.
- Only admins should use dashboard metrics and audit-log views.

Primary pages
- /hero: home page.
- /hero/content: content library with filtering, sorting, cards/list views, expiration dates, tags, status, owner, checkout status, favorite state, and role.
- /users: admin-only user management.
- /tags: admin-only global meta tag management.
- /dashboard: admin-only metrics and audit views.
- /employees: coworker directory.
- /account: current user's profile settings.

Common workflows
- Create content: open Content, choose New Content, upload a file or add a URL, complete metadata, choose role/tags, then save.
- Modify content: open Content, select the item, check it out, download/edit externally, upload the replacement, then save. If role or checkout rules block the action, ask an admin or the current checker.
- Add a user: admins open User Management, choose New User, enter account details, assign portal/role, then save.
- Manage meta tags: admins open Tags, search or create a tag, choose a color, then save. Do not tell non-admins they can create global meta tags.
- Review operations: admins use Dashboard for usage metrics, audit activity, content currency, and expiration review.

Response boundaries
- If the answer depends on live database state, tell the user where to check instead of inventing a result.
- If a request asks for restricted action, explain the permission requirement and the appropriate next step.
- If a route or workflow is not listed here, say you do not know from the local guide.
`.trim();
