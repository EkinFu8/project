import { TopNav } from "@myapp/ui/components/top-nav";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HeroPage from "./pages/hero";
import UnderwriterPage from "./pages/underwriter";
import BusinessAnalyst from "@/pages/business-analyst.tsx";
import EmployeesFormPage from "@/pages/employees-form.tsx";
import DashboardPage from "@/pages/dashboard.tsx";

const navItems = [
  { label: "Hero", to: "/hero" },
  { label: "Underwriter", to: "/underwriter" },
  { label: "Business Analyst", to: "/businessAnalyst" },
  { label: "Employees", to: "/employees" },
  { label: "Dashboard", to: "/dashboard" },
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
          <Route path="/businessAnalyst" element={<BusinessAnalyst/>} />
          <Route path="/employees" element={<EmployeesFormPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
