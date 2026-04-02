import { NavLink } from "react-router";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
}

function TopNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="border-b border-border bg-background px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center gap-6">
        <span className="text-lg font-bold tracking-tight">myapp</span>
        <div className="flex gap-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground",
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
