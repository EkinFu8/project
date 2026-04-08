import { TopNav } from "@myapp/ui/components/top-nav";
import { Loader2 } from "lucide-react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import { useSession } from "@/auth/session-context";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import AccountPage from "@/pages/account/page.tsx";
import ContentFormPage from "@/pages/content/content-form.tsx";
import ContentListPage from "@/pages/content/page.tsx";
import HeroLayout from "@/pages/hero/layout.tsx";
import EmployeeDetailPage from "@/pages/employees/employee-detail.tsx";
import EmployeesPage from "@/pages/employees/page.tsx";
import LoginFormPage from "@/pages/login.tsx";
import BusinessAnalystPage from "@/pages/business-analyst/page.tsx";
import UnderwriterPage from "@/pages/underwriter/page.tsx";

function LegacyContentEditRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/hero/content/${id}/edit`} replace />;
}

const WEB_APP_NOTICE = "You were signed out. Please sign in again.";

function canUseWebApp(portal: string | undefined) {
  return portal === "employee" || portal === "admin";
}

function AuthSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-hanover-green" />
    </div>
  );
}

function WebLoginRoute() {
  const { session, loading: sessionLoading } = useSession();
  const location = useLocation();
  const state = location.state as { from?: string; notice?: string } | null;

  const accessQuery = trpc.user.myAccess.useQuery(undefined, {
    enabled: Boolean(session),
  });

  const loading = sessionLoading || (Boolean(session) && accessQuery.isLoading);

  if (sessionLoading) return <AuthSplash />;
  if (session && accessQuery.isError) {
    void supabase.auth.signOut();
    return <AuthSplash />;
  }
  if (loading) return <AuthSplash />;
  if (session && canUseWebApp(accessQuery.data?.portal)) return <Navigate to="/hero" replace />;

  return (
    <LoginFormPage
      portal="employee"
      defaultRedirect="/hero"
      bannerText={state?.notice}
    />
  );
}

function ProtectedLayout() {
  const { session, loading: sessionLoading } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const accessQuery = trpc.user.myAccess.useQuery(undefined, {
    enabled: Boolean(session),
  });

  const loading = sessionLoading || (Boolean(session) && accessQuery.isLoading);

  if (sessionLoading) return <AuthSplash />;
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (accessQuery.isError) {
    void supabase.auth.signOut();
    return <Navigate to="/login" replace state={{ notice: WEB_APP_NOTICE }} />;
  }
  if (loading) return <AuthSplash />;
  if (!canUseWebApp(accessQuery.data?.portal)) {
    void supabase.auth.signOut();
    return <Navigate to="/login" replace state={{ notice: WEB_APP_NOTICE }} />;
  }

  const jobNav =
    accessQuery.data?.role === "business-analyst"
      ? ({ label: "Business Analyst", to: "/business-analyst" } as const)
      : ({ label: "Underwriter", to: "/underwriter" } as const);
  const navItems = [
    { label: "Content", to: "/hero/content" },
    { label: jobNav.label, to: jobNav.to },
    { label: "Coworkers", to: "/employees" },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav items={navItems} brandTo="/hero" accountMenu={{ settingsTo: "/account", onSignOut: handleSignOut }} />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<WebLoginRoute />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/hero" replace />} />
          <Route path="/hero" element={<HeroLayout />}>
            <Route index element={<ContentListPage />} />
            <Route path="content">
              <Route index element={<ContentListPage />} />
              <Route path="new" element={<ContentFormPage />} />
              <Route path=":id/edit" element={<ContentFormPage />} />
            </Route>
          </Route>
          <Route path="/content" element={<Navigate to="/hero/content" replace />} />
          <Route path="/underwriter" element={<UnderwriterPage />} />
          <Route path="/business-analyst" element={<BusinessAnalystPage />} />
          <Route path="/businessAnalyst" element={<Navigate to="/business-analyst" replace />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/content/new" element={<Navigate to="/hero/content/new" replace />} />
          <Route path="/content/:id/edit" element={<LegacyContentEditRedirect />} />
          <Route path="/dashboard" element={<Navigate to="/hero" replace />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/hero" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
