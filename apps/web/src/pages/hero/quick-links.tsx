function HeroQuickLinks() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-l-4 border-l-hanover-green bg-card p-6">
            <h3 className="mb-4 text-lg font-bold text-foreground">My Frequently Used Links</h3>
            <ul className="space-y-3">
              <li>
                <span className="cursor-pointer text-hanover-green hover:underline">
                  Underwriting Guidelines Portal
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-hanover-green hover:underline">
                  Claims Status Dashboard
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-hanover-green hover:underline">
                  Policy Document Repository
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-hanover-green hover:underline">
                  Training Resources Hub
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-hanover-green hover:underline">
                  IT Support Ticketing System
                </span>
              </li>
            </ul>
          </div>

          <div className="border-l-4 border-l-hanover-green bg-card p-6">
            <h3 className="mb-4 text-lg font-bold text-foreground">
              {"My Role's Frequently Used Links"}
            </h3>
            <ul className="space-y-3">
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
                  Agent Performance Reports
                </span>
              </li>
              <li>
                <span className="cursor-pointer text-hanover-green hover:underline">
                  Compliance Checklist
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
      </div>
    </section>
  );
}

export { HeroQuickLinks };
