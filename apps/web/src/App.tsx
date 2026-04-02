import { TopNav } from "@myapp/ui/components/top-nav";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import HeroPage from "./pages/hero";
import UnderwriterPage from "./pages/underwriter";

const navItems = [
  { label: "Hero", to: "/hero" },
  { label: "Underwriter", to: "/underwriter" },
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
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
