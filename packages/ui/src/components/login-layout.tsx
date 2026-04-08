import type { ReactNode } from "react";
import hanoverLogo from "../assets/hanover-logo.png";
import { cn } from "../lib/utils";

type LoginLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Full-viewport Hanover-branded backdrop for sign-in screens: deep blue gradient, logo, and card slot.
 */
function LoginLayout({ title, subtitle, children, className }: LoginLayoutProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden text-white",
        // Solid base + layered gradients (minimal, on-brand)
        "bg-hanover-deepblue",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-hanover-deepblue via-[#243458] to-[#131e36]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.07]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-[min(55vh,420px)] w-[min(85vw,520px)] rounded-full bg-hanover-green/[0.12] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 h-[min(50vh,380px)] w-[min(90vw,480px)] rounded-full bg-white/[0.06] blur-3xl"
      />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:py-14">
        <header className="mb-8 flex w-full max-w-md flex-col items-center gap-5 sm:mb-10">
          <img
            src={hanoverLogo}
            alt="The Hanover Insurance Group"
            height={40}
            className="h-9 w-auto max-w-[min(100%,13rem)] object-contain object-center brightness-0 invert sm:h-10"
          />
          <div className="h-1 w-14 rounded-full bg-hanover-green shadow-[0_0_20px_rgba(73,119,40,0.45)]" />
          <div className="text-center">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-balance text-sm leading-relaxed text-white/75">{subtitle}</p>
            ) : null}
          </div>
        </header>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export type { LoginLayoutProps };
export { LoginLayout };
