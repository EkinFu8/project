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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-12 text-center shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-hanover-green">
          Built With
        </p>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">Technology Stack</h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
          This project is built on the PERN stack — PostgreSQL, Express, React, and Node.js —
          extended with Prisma for database access, tRPC for typesafe APIs, Supabase for hosting,
          and Vite as the development server.
        </p>
      </div>

      {/* Tech grid */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          {technologies.map((t) => (
            <a
              key={t.title}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-hanover-green/40 hover:shadow-md"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-2">
                <img
                  src={t.image}
                  alt={t.title}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-center text-sm font-semibold text-foreground">{t.title}</p>
              <p className="mt-1 text-center text-xs leading-snug text-muted-foreground">
                {t.subtitle}
              </p>
              <span className="mt-3 text-xs font-medium text-hanover-green opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Visit site →
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreditsPage;
