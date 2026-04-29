import ExpressLogo from "@/assets/expressjslogo.jpg";
import NodeJSLogo from "@/assets/nodejslogo.png";
import PostgresLogo from "@/assets/postgresslogo.jpg";
import PrismaLogo from "@/assets/prismalogo.png";
import ReactLogo from "@/assets/reactlogo.png";
import SupabaseLogo from "@/assets/supabaselogo.jpg";
import TRPCLogo from "@/assets/trpclogo.png";
import ViteLogo from "@/assets/vitelogo.png";

function CreditsPage() {
  const technologies = [
    {
      title: "Prisma",
      subtitle: "Open source Node.js based ORM",
      image: PrismaLogo,
      link: "https://prisma.io",
    },
    {
      title: "Node.js",
      subtitle: "Open source JavaScript runtime",
      image: NodeJSLogo,
      link: "https://nodejs.org",
    },
    {
      title: "PostgreSQL",
      subtitle: "Open source SQL relational database",
      image: PostgresLogo,
      link: "https://postgresql.org",
    },
    {
      title: "React",
      subtitle: "Open source frontend web framework",
      image: ReactLogo,
      link: "https://react.dev/",
    },
    {
      title: "Supabase",
      subtitle: "Web-based PostgreSQL hosting platform",
      image: SupabaseLogo,
      link: "https://supabase.com/",
    },
    {
      title: "tRPC",
      subtitle: "Typesafe end-to-end API library",
      image: TRPCLogo,
      link: "https://trpc.io/",
    },
    {
      title: "Vite",
      subtitle: "Local development server",
      image: ViteLogo,
      link: "https://vite.dev/",
    },
    {
      title: "Express.js",
      subtitle: "Fast, minimalist web framework for Node.js",
      image: ExpressLogo,
      link: "https://expressjs.com/",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-8 text-center shadow-sm animate-fade-in-down sm:px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-hanover-green">
          Built With
        </p>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Technology Stack
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
          This project is built on the PERN stack — PostgreSQL, Express, React, and Node.js —
          extended with Prisma for database access, tRPC for typesafe APIs, Supabase for hosting,
          and Vite as the development server.
        </p>
      </div>

      {/* Tech grid */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 stagger-children sm:grid-cols-3 md:grid-cols-4">
          {technologies.map((t) => (
            <a
              key={t.title}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover-lift flex flex-col items-center rounded-lg border border-border bg-card p-4 shadow-sm hover:border-hanover-green/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hanover-green/40 focus-visible:ring-offset-2 sm:p-5"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted p-2 transition-colors duration-300 group-hover:border-hanover-green/30 group-hover:bg-hanover-green/5 sm:h-16 sm:w-16">
                <img
                  src={t.image}
                  alt={t.title}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                />
              </div>
              <p className="text-center text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-hanover-green">
                {t.title}
              </p>
              <p className="mt-1 text-center text-xs leading-snug text-muted-foreground">
                {t.subtitle}
              </p>
              <span className="mt-3 inline-flex items-center gap-0.5 text-xs font-medium text-hanover-green opacity-0 transition-all duration-200 group-hover:opacity-100">
                Visit site
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreditsPage;
