import { TopNav } from "@myapp/ui/components/top-nav";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import BusinessAnalyst from "@/pages/business-analyst";
import ContentFormPage from "@/pages/content-form";
import ContentListPage from "@/pages/content-list";
import DashboardPage from "@/pages/dashboard";
import EmployeesPage from "@/pages/employees";
import EmployeesFormPage from "@/pages/employees-form";
import HeroPage from "./pages/hero";
import UnderwriterPage from "./pages/underwriter";
import LoginFormPage from "./pages/login";

const navItems = [
  { label: "Hero", to: "/hero" },
  { label: "Underwriter", to: "/underwriter" },
  { label: "Business Analyst", to: "/businessAnalyst" },
  { label: "Employees", to: "/employees" },
  { label: "Content", to: "/content" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Login", to: "/login" },
];

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <TopNav items={navItems} />
        <Routes>
          <Route path="/" element={<Navigate to="/hero" replace />} />
          <Route path="/hero" element={<HeroPage />} />
          <Route path="/underwriter" element={<UnderwriterPage />} />
          <Route path="/businessAnalyst" element={<BusinessAnalyst />} />

          {/* Employees: list → create / edit */}
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/employees/new" element={<EmployeesFormPage />} />
          <Route path="/employees/:id" element={<EmployeesFormPage />} />

          {/* Content: list → create / edit */}
          <Route path="/content" element={<ContentListPage />} />
          <Route path="/content/new" element={<ContentFormPage />} />
          <Route path="/content/:id/edit" element={<ContentFormPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginFormPage/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
