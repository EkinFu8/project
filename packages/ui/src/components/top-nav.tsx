import { NavLink } from "react-router";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
}

function TopNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="w-full border-b border-border bg-hanover-deepblue shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <span className="text-lg font-bold tracking-tight text-white">
          The Hanover iBank
        </span>
        <div className="flex items-center gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2 text-sm font-medium transition-colors border-b-2",
                  isActive
                    ? "text-white border-white"
                    : "text-gray-300 border-transparent hover:text-white hover:border-gray-400",
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

export { TopNav };
export type { NavItem };
