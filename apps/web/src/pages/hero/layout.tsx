import { Outlet, useLocation } from "react-router";
import { HeroBanner } from "@/pages/hero/banner.tsx";

function HeroLayout() {
  const { pathname } = useLocation();
  const isHeroHome = pathname === "/hero" || pathname === "/hero/";

  return (
    <div className="min-h-screen bg-background">
      {isHeroHome ? <HeroBanner /> : null}
      <div className="bg-muted">
        <Outlet />
      </div>
    </div>
  );
}

export default HeroLayout;
