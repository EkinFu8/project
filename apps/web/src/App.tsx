import CMSChatbot from "@myapp/ui/components/chatbot";
import { TopNav } from "@myapp/ui/components/top-nav";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import { useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import { useSession } from "@/auth/session-context";
import { useNotificationReadState } from "@/hooks/use-notification-read-state";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import AboutPage from "@/pages/about/page.tsx";
import AccountPage from "@/pages/account/page.tsx";
import UsersPage from "@/pages/admin/users/page.tsx";
import UserFormPage from "@/pages/admin/users/user-form.tsx";
import BusinessAnalystPage from "@/pages/business-analyst/page.tsx";
import ContentFormPage from "@/pages/content/content-form.tsx";
import ContentPage from "@/pages/content/page.tsx";
import CreditsPage from "@/pages/credits/page.tsx";
import DashboardPage from "@/pages/dashboard/page.tsx";
import EmployeeDetailPage from "@/pages/employees/employee-detail.tsx";
import EmployeesPage from "@/pages/employees/page.tsx";
import HelpPage from "@/pages/help/page.tsx";
import HeroLayout from "@/pages/hero/layout.tsx";
import LoginFormPage from "@/pages/login.tsx";
import NotificationsPage from "@/pages/notifications/page.tsx";
import TagsPage from "@/pages/tags/TagsPage";
import UnderwriterPage from "@/pages/underwriter/page.tsx";

function LegacyContentEditRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/hero/content/${id}/edit`} replace />;
}

const SIGNED_OUT_NOTICE = "You were signed out. Please sign in again.";
const CONTENT_SEARCH_FOCUS_EVENT = "content-search:focus";
const USERS_SEARCH_FOCUS_EVENT = "users-search:focus";
const TAGS_SEARCH_FOCUS_EVENT = "tags-search:focus";

function describePage(pathname: string) {
  if (pathname === "/hero" || pathname === "/hero/content") {
    return {
      path: pathname,
      title: "Content library",
      description: "Browsing searchable documents, filters, favorites, tags, owners, and status.",
    };
  }
  if (pathname === "/hero/content/new") {
    return {
      path: pathname,
      title: "New content",
      description: "Creating a content record with upload or URL, metadata, owner, role, and tags.",
    };
  }
  if (pathname.startsWith("/hero/content/")) {
    return {
      path: pathname,
      title: "Content detail",
      description:
        "Viewing or editing one document with checkout, download, upload, and metadata controls.",
    };
  }
  if (pathname === "/notifications") {
    return {
      path: pathname,
      title: "Notifications",
      description:
        "Reviewing document changes, ownership changes, review reminders, and expiration reminders.",
    };
  }
  if (pathname === "/users" || pathname.startsWith("/users/")) {
    return {
      path: pathname,
      title: "User management",
      description: "Admin user account and role management.",
    };
  }
  if (pathname === "/tags") {
    return {
      path: pathname,
      title: "Meta tags",
      description: "Admin global tag management.",
    };
  }
  if (pathname === "/dashboard") {
    return {
      path: pathname,
      title: "Dashboard",
      description: "Admin metrics, audit activity, content currency, and review health.",
    };
  }
  if (pathname === "/employees" || pathname.startsWith("/employees/")) {
    return {
      path: pathname,
      title: "Coworker directory",
      description: "Employee profiles and associated content.",
    };
  }
  if (pathname === "/account") {
    return {
      path: pathname,
      title: "Account settings",
      description: "Current user profile settings.",
    };
  }
  if (pathname === "/help") {
    return {
      path: pathname,
      title: "Help",
      description: "Workflow guidance and product reference.",
    };
  }
  if (pathname === "/gompei") {
    return {
      path: pathname,
      title: "Gompei chat",
      description: "Full-screen assistant conversation with current app context.",
    };
  }
  return {
    path: pathname,
    title: "iBank",
    description: "General app workspace.",
  };
}

type ProtectedOutletContext = {
  assistantContext: ComponentProps<typeof CMSChatbot>["context"];
};

function GompeiPage() {
  const { assistantContext } = useOutletContext<ProtectedOutletContext>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <CMSChatbot
      context={assistantContext}
      initialPrompt={searchParams.get("q") ?? undefined}
      mode="page"
      onNavigate={(to) => navigate(to)}
    />
  );
}

function toTime(value: unknown) {
  if (!value) return null;
  const time = value instanceof Date ? value.getTime() : new Date(String(value)).getTime();
  return Number.isNaN(time) ? null : time;
}

function AuthSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-hanover-green" />
    </div>
  );
}

/** Login route — redirects already-authenticated users to /hero. */
function LoginRoute() {
  const { session, loading: sessionLoading } = useSession();
  const location = useLocation();
  const state = location.state as { notice?: string } | null;

  const accessQuery = trpc.user.myAccess.useQuery(undefined, {
    enabled: Boolean(session),
  });

  if (sessionLoading) return <AuthSplash />;
  if (session && accessQuery.isError) {
    void supabase.auth.signOut();
    return <AuthSplash />;
  }
  if (session && accessQuery.isLoading) return <AuthSplash />;
  if (session && accessQuery.data) {
    return <Navigate to="/hero" replace />;
  }

  return <LoginFormPage bannerText={state?.notice} />;
}

/** Nav items for admin role. */
function adminNavItems() {
  return [
    { label: "Content", to: "/hero/content" },
    { label: "Users", to: "/users" },
    { label: "Tags", to: "/tags" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Help", to: "/help" },
  ];
}

/** Nav items for employee roles. */
function employeeNavItems() {
  return [
    { label: "Content", to: "/hero/content" },
    { label: "Coworkers", to: "/employees" },
    { label: "Help", to: "/help" },
  ];
}

/** Layout wrapper that protects routes behind authentication and shows role-appropriate nav. */
function ProtectedLayout() {
  const { session, loading: sessionLoading } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: me } = trpc.user.myProfile.useQuery();

  const accessQuery = trpc.user.myAccess.useQuery(undefined, {
    enabled: Boolean(session),
  });
  const notificationsQuery = trpc.notifications.myList.useQuery(undefined, {
    enabled: Boolean(session) && Boolean(accessQuery.data),
  });
  const submittedContentQuery = trpc.content.list.useQuery(
    { owner_id: session?.user.id ?? "" },
    {
      enabled: Boolean(session?.user.id) && Boolean(accessQuery.data),
    },
  );
  const { unreadCount, unreadRows } = useNotificationReadState(
    notificationsQuery.data,
    session?.user.id,
  );
  const isContentPage = location.pathname === "/hero" || location.pathname === "/hero/content";
  const isUsersPage = location.pathname === "/users";
  const isUsersRoute = location.pathname.startsWith("/users/");
  const isTagsPage = location.pathname === "/tags";

  const focusCurrentSearch = useCallback(() => {
    if (isUsersPage) {
      window.dispatchEvent(new Event(USERS_SEARCH_FOCUS_EVENT));
      return;
    }

    if (isUsersRoute) {
      navigate("/users", { state: { focusUsersSearch: true } });
      return;
    }

    if (isTagsPage) {
      window.dispatchEvent(new Event(TAGS_SEARCH_FOCUS_EVENT));
      return;
    }

    if (isContentPage) {
      window.dispatchEvent(new Event(CONTENT_SEARCH_FOCUS_EVENT));
      return;
    }

    navigate("/hero/content", { state: { focusContentSearch: true } });
  }, [isContentPage, isTagsPage, isUsersPage, isUsersRoute, navigate]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        focusCurrentSearch();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusCurrentSearch]);

  if (sessionLoading) return <AuthSplash />;
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (accessQuery.isError) {
    void supabase.auth.signOut();
    return <Navigate to="/login" replace state={{ notice: SIGNED_OUT_NOTICE }} />;
  }
  if (accessQuery.isLoading) return <AuthSplash />;

  const role = accessQuery.data?.role;
  const isAdmin = role === "admin";
  const navItems = isAdmin ? adminNavItems() : employeeNavItems();
  const username = me?.name;
  const submittedDocuments = submittedContentQuery.data ?? [];
  const now = Date.now();
  const dueSoon = (notificationsQuery.data ?? []).filter((row) => {
    const message = row.message.toLowerCase();
    return message.includes("due") || message.includes("expires");
  }).length;
  const overdue = (notificationsQuery.data ?? []).filter((row) => {
    const message = row.message.toLowerCase();
    return message.includes("passed") || message.includes("expired");
  }).length;
  const checkedOutByUser = submittedDocuments.filter(
    (document) => document.checked_out_by === session.user.id,
  ).length;
  const assistantContext = {
    user: {
      name: username ? username : "User",
      email: me?.email ?? session.user.email ?? undefined,
      role: role ? role : "Unknown",
      portal: accessQuery.data?.portal ?? undefined,
    },
    page: describePage(location.pathname),
    permissions: {
      isAdmin,
      canCreateContent: true,
      canManageUsers: isAdmin,
      canManageTags: isAdmin,
      canViewDashboard: isAdmin,
      canViewCoworkers: !isAdmin,
    },
    workload: {
      unreadNotifications: unreadCount,
      submittedDocuments: submittedDocuments.length,
      dueSoon,
      overdue,
      checkedOutByUser,
    },
    highlights: [
      ...unreadRows.slice(0, 3).map((row) => ({
        id: row.id,
        label: row.fileName,
        detail: row.message,
        to: row.fileID ? `/hero/content/${row.fileID}/edit` : "/notifications",
        tone: "attention" as const,
      })),
      ...submittedDocuments.slice(0, 3).map((document) => {
        const reviewTime = toTime(document.next_review_date);
        const expirationTime = toTime(document.expiration_date);
        const needsReview = reviewTime !== null && reviewTime <= now + 30 * 24 * 60 * 60 * 1000;
        const expired = expirationTime !== null && expirationTime < now;

        return {
          id: document.fileID,
          label: document.filename ?? document.fileID,
          detail: expired
            ? "Expired"
            : needsReview
              ? "Review due soon"
              : (document.document_status ?? "Submitted document"),
          to: `/hero/content/${document.fileID}/edit`,
          tone: expired || needsReview ? ("attention" as const) : ("muted" as const),
        };
      }),
    ],
    actions: [
      {
        label: unreadCount > 0 ? `Open notifications (${unreadCount})` : "Open notifications",
        to: "/notifications",
        description: "Review document changes and due-date reminders.",
        tone: unreadCount > 0 ? ("primary" as const) : ("neutral" as const),
      },
      {
        label: "Open content",
        to: "/hero/content",
        description: "Search and filter documents available to your role.",
        tone: "neutral" as const,
      },
      {
        label: "New content",
        to: "/hero/content/new",
        description: "Create a document record for your allowed role.",
        tone: "neutral" as const,
      },
      ...(isAdmin
        ? [
            {
              label: "Open dashboard",
              to: "/dashboard",
              description: "Review metrics, audits, and content health.",
              adminOnly: true,
              tone: "neutral" as const,
            },
            {
              label: "Open users",
              to: "/users",
              description: "Manage accounts, roles, and portal access.",
              adminOnly: true,
              tone: "neutral" as const,
            },
            {
              label: "Open tags",
              to: "/tags",
              description: "Manage global meta tags.",
              adminOnly: true,
              tone: "neutral" as const,
            },
          ]
        : [
            {
              label: "Open coworkers",
              to: "/employees",
              description: "Find coworkers and profile context.",
              tone: "neutral" as const,
            },
          ]),
      {
        label: "Open help",
        to: "/help",
        description: "View workflow help.",
        tone: "neutral" as const,
      },
    ],
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav
        items={navItems}
        brandTo="/hero"
        accountMenu={{
          notificationsTo: "/notifications",
          unreadNotificationCount: unreadCount,
          settingsTo: "/account",
          links: [
            { label: "Gompei", to: "/gompei" },
            { label: "About", to: "/about" },
            { label: "Credits", to: "/credits" },
          ],
          onSignOut: handleSignOut,
          photoUrl: accessQuery.data?.photo_url,
        }}
      />
      {location.pathname !== "/gompei" ? (
        <CMSChatbot
          context={assistantContext}
          mode="launcher"
          onSubmitQuestion={(question) => navigate(`/gompei?q=${encodeURIComponent(question)}`)}
        />
      ) : null}
      <Outlet context={{ assistantContext } satisfies ProtectedOutletContext} />
    </div>
  );
}

/** Guard that only renders children for admin-role users; others get redirected home. */
function AdminOnly() {
  const accessQuery = trpc.user.myAccess.useQuery();
  if (accessQuery.isLoading) return <AuthSplash />;
  if (accessQuery.data?.role !== "admin") {
    return <Navigate to="/hero" replace />;
  }
  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedLayout />}>
          {/* Main hero page — content view adapts to role */}
          <Route path="/" element={<Navigate to="/hero" replace />} />
          <Route path="/hero" element={<HeroLayout />}>
            <Route index element={<ContentPage />} />
            <Route path="content">
              <Route index element={<ContentPage />} />
              <Route path="new" element={<ContentFormPage />} />
              <Route path=":id/edit" element={<ContentFormPage />} />
            </Route>
          </Route>

          {/* Employee role pages */}
          <Route path="/underwriter" element={<UnderwriterPage />} />
          <Route path="/business-analyst" element={<BusinessAnalystPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />

          {/* Admin-only: user management */}
          <Route element={<AdminOnly />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id" element={<UserFormPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Shared */}
          <Route path="/gompei" element={<GompeiPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/credits" element={<CreditsPage />} />

          {/* Legacy redirects */}
          <Route path="/content" element={<Navigate to="/hero/content" replace />} />
          <Route path="/content/new" element={<Navigate to="/hero/content/new" replace />} />
          <Route path="/content/:id/edit" element={<LegacyContentEditRedirect />} />
          <Route path="/businessAnalyst" element={<Navigate to="/business-analyst" replace />} />
          <Route path="/admin/metrics" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/hero" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
