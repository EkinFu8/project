const underwriterLinks = [
  "Desktop Management Tool",
  "States on Hold",
  "RiskMeter Online",
  "ISOnet Website",
  "Forms Knowledge Base",
  "Experience & Schedule Rating Plans",
  "Property View",
  "Coastal Guidelines",
  "IPS (Image & Processing System)",
  "Underwriting Workstation",
];

function UnderwriterPage() {
  return (
    <div className="min-h-screen bg-muted">
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in-down">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
              Underwriter Resources
            </h1>
            <p className="text-muted-foreground">
              Tools and references for Commercial Underwriters
            </p>
          </div>

          {/* Link Cards Grid */}
          <div className="mb-6 grid gap-3 stagger-children md:grid-cols-2">
            {underwriterLinks.map((link) => (
              <div
                key={link}
                className="group cursor-pointer rounded-lg border border-border border-l-4 border-l-transparent bg-card px-4 py-3 shadow-sm transition-colors duration-150 hover:border-l-hanover-green hover:bg-muted/25"
              >
                <span className="font-bold text-foreground transition-colors duration-200 group-hover:text-hanover-green">
                  {link}
                </span>
              </div>
            ))}
          </div>

          {/* Persona Summary Card */}
          <div className="animate-fade-in-up rounded-lg border border-border border-l-4 border-l-[#C9A84C] bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6">
            <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">
              About the Underwriter
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-foreground">Traits: </span>
                <span className="text-muted-foreground">Analytical, Precise, Deadline-driven</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Access: </span>
                <span className="text-muted-foreground">Daily</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Criticality: </span>
                <span className="text-muted-foreground">Very High</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Goal: </span>
                <span className="text-muted-foreground">
                  {'"Make informed underwriting decisions quickly and accurately"'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnderwriterPage;
