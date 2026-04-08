import { Outlet } from "react-router";
import { HeroBanner } from "@/pages/hero/banner.tsx";
import { HeroQuickLinks } from "@/pages/hero/quick-links.tsx";

function HeroLayout() {
  return (
    <div className="min-h-screen bg-background">
      <HeroBanner />
      <div className="bg-muted">
        <HeroQuickLinks />
        <Outlet />
      </div>
    </div>
  );
}

export default HeroLayout;
