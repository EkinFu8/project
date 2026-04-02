import { NavLink } from "react-router";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
}

function TopNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="w-full border-b border-border bg-background shadow-sm">
      <div className="flex items-center gap-8 px-8 py-4">
        <span className="text-lg font-bold tracking-tight">myapp</span>
        <div className="flex items-center gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
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
