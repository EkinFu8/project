import { UserRound } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { NavLink } from "react-router";
import hanoverLogo from "../assets/hanover-logo.png";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  to: string;
}

interface TopNavProps {
  items: NavItem[];
  /** Logo links here (e.g. `/hero` for the app landing page). */
  brandTo?: string;
  /** Account menu (profile trigger, Settings link, Log out). Shown for signed-in layouts. */
  accountMenu?: {
    settingsTo: string;
    onSignOut: () => void | Promise<void>;
  };
}

const menuItemClass =
  "relative flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground";

const menuContentClass =
  "z-[200] min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg";

function TopNav({ items, brandTo, accountMenu }: TopNavProps) {
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
          {accountMenu ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                type="button"
                className={cn(
                  "flex h-full items-center border-b-2 border-transparent px-0.5 text-white outline-none transition-colors sm:px-1",
                  "hover:border-hanover-green/50 data-[state=open]:border-hanover-green/60",
                  "focus-visible:ring-2 focus-visible:ring-hanover-green focus-visible:ring-offset-2 focus-visible:ring-offset-hanover-deepblue",
                )}
                aria-label="Account menu"
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10",
                    "transition-colors hover:border-white/40 hover:bg-white/15",
                  )}
                >
                  <UserRound className="size-4" aria-hidden strokeWidth={2} />
                </span>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className={menuContentClass} sideOffset={8} align="end" collisionPadding={8}>
                  <DropdownMenu.Item asChild className={menuItemClass}>
                    <NavLink to={accountMenu.settingsTo} className={cn(menuItemClass, "no-underline")}>
                      Settings
                    </NavLink>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    className={cn(
                      menuItemClass,
                      "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
                    )}
                    onSelect={(event) => {
                      event.preventDefault();
                      void Promise.resolve(accountMenu.onSignOut());
                    }}
                  >
                    Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export type { NavItem };
export { TopNav };
