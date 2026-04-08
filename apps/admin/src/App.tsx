import { TopNav } from "@myapp/ui/components/top-nav";
import { Loader2 } from "lucide-react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router";
import { useSession } from "@/auth/session-context";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";
import AccountPage from "@/pages/account/page";
import AdminContentPage from "@/pages/content/page";
import LoginFormPage from "@/pages/login";
import UsersPage from "@/pages/users/page";
import UserFormPage from "@/pages/users/user-form";

const navItems = [
  { label: "Content", to: "/content" },
  { label: "User Management", to: "/users" },
];

const ADMIN_APP_NOTICE = "You were signed out. Please sign in again.";

function canUseAdminApp(portal: string | undefined) {
  return portal === "admin" || portal === "employee";
}

function AuthSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-hanover-green" />
    </div>
  );
}

function AdminLoginRoute() {
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
  if (session && canUseAdminApp(accessQuery.data?.portal)) return <Navigate to="/content" replace />;

  return (
    <LoginFormPage
      portal="admin"
      defaultRedirect="/content"
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
    return <Navigate to="/login" replace state={{ notice: ADMIN_APP_NOTICE }} />;
  }
  if (loading) return <AuthSplash />;
  if (!canUseAdminApp(accessQuery.data?.portal)) {
    void supabase.auth.signOut();
    return <Navigate to="/login" replace state={{ notice: ADMIN_APP_NOTICE }} />;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav
        items={navItems}
        brandTo="/content"
        accountMenu={{ settingsTo: "/account", onSignOut: handleSignOut }}
      />
      <div className="min-h-[calc(100vh-2.75rem)] bg-muted">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLoginRoute />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/content" replace />} />
          <Route path="/content" element={<AdminContentPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/new" element={<UserFormPage />} />
          <Route path="/users/:id" element={<UserFormPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/content" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
