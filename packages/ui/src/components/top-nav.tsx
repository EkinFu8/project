import { NavLink } from "react-router";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
}

function TopNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="w-full bg-hanover-deepblue py-2">
      <div className="flex h-24 w-full items-center justify-between px-8">
        <span className="shrink-0 text-lg font-bold tracking-tight text-white">Hanover</span>

        <div className="flex h-full items-center gap-2">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex h-full items-center border-b-2 px-4 text-sm font-medium transition-colors",
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
