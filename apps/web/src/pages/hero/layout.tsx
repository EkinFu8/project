import { Outlet, useLocation } from "react-router";
import { HeroBanner } from "@/pages/hero/banner.tsx";
import { HeroQuickLinks } from "@/pages/hero/quick-links.tsx";

function HeroLayout() {
  const { pathname } = useLocation();
  const isHeroHome = pathname === "/hero" || pathname === "/hero/";

  return (
    <div className="min-h-screen bg-background">
      {isHeroHome ? <HeroBanner /> : null}
      <div className="bg-muted">
        {isHeroHome ? <HeroQuickLinks /> : null}
        <Outlet />
      </div>
    </div>
  );
}

export default HeroLayout;
