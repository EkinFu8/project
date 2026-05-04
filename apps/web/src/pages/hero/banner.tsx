import { FileText, Minus, Plus, Users } from "lucide-react";
import { Link } from "react-router";
import heroCampus from "@/assets/hero-campus.png";
import { trpc } from "@/lib/trpc";
import { useAppPreferences } from "@/store/app-preferences";

const HERO_CONTENT_PATH = "/hero#content-library";

function HeroBanner() {
  const heroExpanded = useAppPreferences((state) => state.heroExpanded);
  const setHeroExpanded = useAppPreferences((state) => state.setHeroExpanded);
  const { data: access } = trpc.user.myAccess.useQuery();
  const isAdmin = access?.role === "admin";

  const quickLinks = isAdmin
    ? [
        { to: HERO_CONTENT_PATH, label: "Content", icon: FileText },
        { to: "/users", label: "Users", icon: Users },
      ]
    : [
        { to: HERO_CONTENT_PATH, label: "Content", icon: FileText },
        { to: "/employees", label: "Coworkers", icon: Users },
      ];

  return (
    <div
      className={`relative isolate w-full transition-[min-height,max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        heroExpanded
          ? "min-h-[min(22rem,calc(100dvh-4.75rem))] max-h-none overflow-hidden lg:min-h-[min(30rem,calc(100dvh-5.75rem))]"
          : "min-h-10 max-h-10 overflow-hidden border-b border-border bg-card"
      }`}
    >
      <img
        src={heroCampus}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out ${
          heroExpanded ? "scale-100 opacity-100" : "scale-105 opacity-0"
        }`}
        decoding="async"
      />
      {/* Subtle dark overlay for legibility, fades in with the image */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent transition-opacity duration-700 ${
          heroExpanded ? "opacity-100" : "opacity-0"
        }`}
      />

      {heroExpanded ? (
        <button
          type="button"
          aria-expanded
          aria-controls="hero-panel"
          aria-label="Minimize hero section"
          onClick={() => setHeroExpanded(false)}
          className="group absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-black/20 p-0.5 text-white outline-none backdrop-blur-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] transition-all duration-200 hover:bg-black/40 hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-hanover-green focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          <Minus
            className="size-5 transition-transform duration-200"
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={false}
          aria-controls="hero-panel"
          aria-label="Show hero section"
          onClick={() => setHeroExpanded(true)}
          className="absolute right-3 top-1 z-20 flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40"
        >
          <Plus className="size-3.5" aria-hidden />
          Show hero
        </button>
      )}

      {heroExpanded ? (
        <div
          id="hero-panel"
          className="relative z-10 w-full animate-fade-in-up px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12"
        >
          <div className="mx-auto w-full max-w-[22rem] rounded-xl border border-border/60 bg-card/90 p-5 shadow-lg shadow-black/20 backdrop-blur-md transition-shadow duration-300 hover:shadow-xl hover:shadow-black/25 sm:max-w-[24rem] sm:p-5 lg:mx-0 lg:ml-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
              Welcome to Hanover
            </h1>

            <div
              className={`mt-4 grid gap-2 stagger-children sm:gap-2.5 ${quickLinks.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-md bg-hanover-green px-1 py-2.5 text-center text-white shadow-sm shadow-hanover-green/20 transition-all duration-200 hover:bg-hanover-green/90 hover:shadow-md hover:shadow-hanover-green/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:min-h-16 sm:py-2.5"
                >
                  <link.icon
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110 sm:size-5"
                    aria-hidden
                  />
                  <span className="text-[0.6rem] font-medium leading-tight sm:text-[0.65rem]">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { HERO_CONTENT_PATH, HeroBanner };
