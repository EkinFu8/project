import { NavLink } from "react-router";
import hanoverLogo from "../assets/hanover-logo.png";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  label: string;
  to: string;
}

interface TopNavProps {
  items: NavItem[];
  /** Logo links here (e.g. `/hero` for the app landing page). */
  brandTo?: string;
}

function TopNav({ items, brandTo }: TopNavProps) {
  const logo = (
    <img
      src={hanoverLogo}
      alt="The Hanover Insurance Group"
      height={24}
      className="h-6 max-h-6 w-auto max-w-[min(100%,8rem)] shrink-0 object-contain object-left brightness-0 invert"
    />
  );

  return (
    <nav className="w-full bg-hanover-deepblue">
      <div className="flex h-11 w-full items-center justify-between px-4 sm:px-6">
        {brandTo ? (
          <NavLink
            to={brandTo}
            className={({ isActive }) =>
              cn(
                "flex h-full shrink-0 items-center border-b-2 border-transparent",
                isActive ? "border-hanover-green" : "hover:border-hanover-green/50",
              )
            }
          >
            {logo}
          </NavLink>
        ) : (
          logo
        )}

        <div className="flex h-full items-center gap-0.5 sm:gap-2">
          <ThemeToggle className="mr-0.5 rounded-md p-1 text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-hanover-green focus-visible:ring-offset-1 focus-visible:ring-offset-hanover-deepblue [&_svg]:size-4" />
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex h-full items-center border-b-2 px-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:text-sm",
                  isActive
                    ? "border-hanover-green text-white"
                    : "border-transparent text-white hover:border-hanover-green/50",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export type { NavItem };
export { TopNav };
