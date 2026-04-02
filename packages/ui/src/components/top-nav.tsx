import { NavLink } from "react-router";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
}

function TopNav({ items }: { items: NavItem[] }) {
  return (
      <nav className="w-full border-b border-border bg-hanover-deepblue">
        <div className="flex items-center justify-between px-8 h-20">
        <span className="text-lg font-bold tracking-tight text-white">
          The Hanover iBank
        </span>
          <div className="flex items-center gap-1 h-full">
            {items.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        cn(
                            "flex items-center h-full px-4 text-sm font-medium transition-colors border-b-2",
                            isActive
                                ? "text-white border-hanover-green"
                                : "text-white border-transparent hover:border-hanover-green/50",
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
