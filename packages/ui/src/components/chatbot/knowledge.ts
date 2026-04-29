import type { AssistantToolManifest } from "./types";

export const DEFAULT_MODEL = "Phi-3.5-mini-instruct-q4f16_1-MLC";

export const ASSISTANT_TOOLS: AssistantToolManifest[] = [
  {
    name: "page_state",
    description:
      "Available context snapshot with the signed-in user, current page, role permissions, notifications, todos, and submitted-document counts.",
    availability: "available",
  },
  {
    name: "navigate_action",
    description:
      "Available UI action. Recommend navigation by emitting ACTION: /route | Label so the chat renders a clickable button.",
    availability: "available",
  },
  {
    name: "checkout_overdue_content",
    description:
      "Available controlled action. Checks out overdue files the signed-in user is allowed to edit, then returns edit links for the checked-out files.",
    availability: "available",
  },
  {
    name: "content_search",
    description:
      "Planned retrieval hook for searching indexed document bodies, metadata, and help articles with server-side permission checks.",
    availability: "planned",
  },
  {
    name: "permission_check",
    description:
      "Planned server-side policy hook for checking a specific action before recommending it.",
    availability: "planned",
  },
  {
    name: "admin_action_router",
    description:
      "Planned controlled action hook for creating users, editing tags, and other admin-only workflows.",
    availability: "planned",
    requiresAdmin: true,
  },
];

export const APP_GUIDE = `
Product
- iBank is a content management app for employee-facing insurance documents.
- The assistant is a native product guide and action harness. It can use the signed-in snapshot, render navigation buttons, and perform explicitly available controlled site actions. It cannot bypass permissions or invent live database results.

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
- /notifications: document changes, review reminders, and expiration reminders visible to the user.
- /account: current user's profile settings.
- /help: workflow reference and troubleshooting.

Common workflows
- Create content: open Content, choose New Content, upload a file or add a URL, complete metadata, choose role/tags, then save.
- Modify content: open Content, select the item, check it out, download/edit externally, upload the replacement, then save. If role or checkout rules block the action, ask an admin or the current checker.
- Add a user: admins open User Management, choose New User, enter account details, assign portal/role, then save.
- Manage meta tags: admins open Tags, search or create a tag, choose a color, then save. Do not tell non-admins they can create global meta tags.
- Review operations: admins use Dashboard for usage metrics, audit activity, content currency, and expiration review.
- Check notifications: open Notifications. The snapshot may include unread counts and recent items.
- Check todos: use notification and due-review/expired counts in the snapshot. Do not pretend to have more todo data than the snapshot provides.
- Check submitted documents: use the submitted-document count and highlights in the snapshot, then offer Content if they need the list.
- Check out overdue files: when the user asks to check out all overdue or expired files, use the checkout_overdue_content action. Reply with what changed and render edit buttons for the checked-out files.

Response boundaries
- If the answer depends on live database state not present in the snapshot, say what you can see and offer a button to the right page.
- If a request asks for restricted action, explain the permission requirement and the appropriate next step.
- If a route or workflow is not listed here, say you do not know from the local guide.
`.trim();
