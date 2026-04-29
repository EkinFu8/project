import {
  Bell,
  BookOpenCheck,
  CircleHelp,
  FileSearch,
  Filter,
  Heart,
  PencilLine,
  UserRoundCog,
} from "lucide-react";
import { Link } from "react-router";

const tutorialSteps = [
  {
    title: "Start with the content library",
    description:
      "Open Content to browse documents available to your role. Use the search bar when you know the file name or a phrase from the document.",
    icon: FileSearch,
    link: { label: "Open content", to: "/hero/content" },
  },
  {
    title: "Narrow the list",
    description:
      "Filter by role, status, document type, format, or tag to reduce the library to the files that match the work you are doing.",
    icon: Filter,
  },
  {
    title: "Save important files",
    description:
      "Use the favorite control on content cards to keep frequently used files easy to find. Favorites appear first in the library.",
    icon: Heart,
  },
  {
    title: "Watch notifications",
    description:
      "Review Notifications for document updates, ownership changes, and upcoming review dates tied to content you can access.",
    icon: Bell,
    link: { label: "View notifications", to: "/notifications" },
  },
];

const quickReference = [
  {
    title: "Content",
    body: "Browse, search, sort, filter, and open business documents.",
    to: "/hero/content",
  },
  {
    title: "Notifications",
    body: "See recent document changes and review reminders.",
    to: "/notifications",
  },
  {
    title: "Coworkers",
    body: "Find employee profiles when your role has access to the directory.",
    to: "/employees",
  },
  {
    title: "Account",
    body: "Update account settings and confirm your signed-in profile.",
    to: "/account",
  },
];

function HelpPage() {
  return (
    <main className="min-h-[calc(100vh-2.75rem)] bg-muted">
      <section className="border-b border-border bg-card px-6 py-10 shadow-sm">
        <div className="mx-auto max-w-5xl animate-fade-in-down">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-hanover-green">
                <CircleHelp className="h-4 w-4" />
                Help Center
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Beginner Tutorial
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                A quick walkthrough for finding content, keeping track of updates, and using the
                main navigation without needing prior experience with the portal.
              </p>
            </div>
            <Link
              to="/hero/content"
              className="group inline-flex w-fit items-center gap-2 rounded-md border border-hanover-green bg-hanover-green px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-hanover-green/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-hanover-green/90 hover:shadow-md hover:shadow-hanover-green/30 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40 focus-visible:ring-offset-2"
            >
              <BookOpenCheck className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              Start browsing
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-fade-in-up">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">First steps</h2>
            <div className="mt-4 grid gap-4 stagger-children">
              {tutorialSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="group hover-lift rounded-lg border border-border bg-card p-5 shadow-sm hover:border-hanover-green/40 hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-hanover-green/10 text-hanover-green transition-all duration-200 group-hover:bg-hanover-green/15 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Step {index + 1}
                        </p>
                        <h3 className="mt-1 text-base font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {step.description}
                        </p>
                        {step.link ? (
                          <Link
                            to={step.link.to}
                            className="group/link mt-3 inline-flex items-center gap-1 text-sm font-semibold text-hanover-green transition-colors hover:text-hanover-green/80"
                          >
                            {step.link.label}
                            <span
                              aria-hidden
                              className="inline-block transition-transform duration-200 group-hover/link:translate-x-0.5"
                            >
                              →
                            </span>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="space-y-6 animate-fade-in-up">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="flex items-center gap-2">
                <PencilLine className="h-5 w-5 text-hanover-green" />
                <h2 className="text-lg font-semibold text-foreground">Editing content</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Users with editing access can create or update content from the Content page. If the
                edit controls are not visible, your account is limited to viewing the documents your
                role needs.
              </p>
            </section>

            <section className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
              <div className="flex items-center gap-2">
                <UserRoundCog className="h-5 w-5 text-hanover-green" />
                <h2 className="text-lg font-semibold text-foreground">Quick reference</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {quickReference.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="group rounded-md border border-border bg-background p-3 transition-all duration-200 hover:border-hanover-green/50 hover:bg-muted hover:translate-x-0.5"
                  >
                    <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-hanover-green">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default HelpPage;
