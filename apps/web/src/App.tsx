import { TopNav } from "@myapp/ui/components/top-nav";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router";
import BusinessAnalyst from "@/pages/business-analyst/page.tsx";
import ContentFormPage from "@/pages/content/content-form.tsx";
import ContentListPage from "@/pages/content/page.tsx";
import DashboardPage from "@/pages/dashboard/page.tsx";
import EmployeesFormPage from "@/pages/employees/employees-form.tsx";
import EmployeesPage from "@/pages/employees/page.tsx";
import HeroLayout from "@/pages/hero/layout.tsx";
import UnderwriterPage from "@/pages/underwriter/page.tsx";

function LegacyContentEditRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/hero/content/${id}/edit`} replace />;
}

const navItems = [
  { label: "Underwriter", to: "/underwriter" },
  { label: "Business Analyst", to: "/businessAnalyst" },
  { label: "Employees", to: "/employees" },
  { label: "Content", to: "/hero/content" },
  { label: "Dashboard", to: "/dashboard" },
];

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <TopNav items={navItems} brandTo="/hero" />
        <Routes>
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
          <Route path="/businessAnalyst" element={<BusinessAnalyst />} />

          {/* Employees: list → create / edit */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/new" element={<EmployeesFormPage />} />
          <Route path="/employees/:id" element={<EmployeesFormPage />} />

          <Route path="/content/new" element={<Navigate to="/hero/content/new" replace />} />
          <Route path="/content/:id/edit" element={<LegacyContentEditRedirect />} />

          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
