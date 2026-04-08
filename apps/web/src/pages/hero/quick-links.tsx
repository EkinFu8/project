function HeroQuickLinks() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-l-hanover-green bg-card p-6">
          <h3 className="mb-4 text-lg font-bold text-foreground">Underwriter quick links</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Shortcuts commonly used with underwriting workflows. Open{" "}
            <span className="font-medium text-foreground">Underwriter</span> in the nav for the full
            tool list.
          </p>
          <ul className="space-y-3 text-sm">
            <li>
              <span className="cursor-pointer text-hanover-green hover:underline">
                Underwriting Guidelines Portal
              </span>
            </li>
            <li>
              <span className="cursor-pointer text-hanover-green hover:underline">
                Commercial Lines Rating Tool
              </span>
            </li>
            <li>
              <span className="cursor-pointer text-hanover-green hover:underline">
                Risk Assessment Calculator
              </span>
            </li>
            <li>
              <span className="cursor-pointer text-hanover-green hover:underline">
                Policy Document Repository
              </span>
            </li>
            <li>
              <span className="cursor-pointer text-hanover-green hover:underline">
                Product Knowledge Base
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export { HeroQuickLinks };
