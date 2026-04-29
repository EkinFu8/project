import ColinImage from "@/assets/colin.png";
import EkingsImage from "@/assets/ekin.png";
import JacobMajorImage from "@/assets/jacob major.png";
import JacobMolniaImage from "@/assets/jacob molnia.png";
import MyantonomoImage from "@/assets/Myantonomo.png";
import MaxCImage from "@/assets/max c.png";
import MaxwellWImage from "@/assets/maxwell w.png";
import RusselsImage from "@/assets/Russel.png";
import RafealImage from "@/assets/rafael.png";
import TobiasImage from "@/assets/tobias.jpg";

function AboutPage() {
  const members = [
    {
      title: "Rafael Mirzoyan",
      subtitle: "Project Manager",
      image: RafealImage,
    },
    {
      title: "Colin Cotton",
      subtitle: "Documentation Analyst",
      image: ColinImage,
    },
    {
      title: "Jacob Major",
      subtitle: "Full Time Software Engineer",
      image: JacobMajorImage,
    },
    {
      title: "Maxwell W.",
      subtitle: "Assistant Lead Software Engineer",
      image: MaxwellWImage,
    },
    {
      title: "Max C.",
      subtitle: "Full Time Software Engineer",
      image: MaxCImage,
    },
    {
      title: "Jacob Molnia",
      subtitle: "Lead Software Engineer",
      image: JacobMolniaImage,
    },
    {
      title: "Tobias G.",
      subtitle: "Assistant Lead Software Engineer",
      image: TobiasImage,
    },
    {
      title: "Ekin C.",
      subtitle: "Full Time Software Engineer",
      image: EkingsImage,
    },
    {
      title: "Russell H.",
      subtitle: "Scrum Master",
      image: RusselsImage,
    },
    {
      title: "Myantonomo G.",
      subtitle: "Product Owner",
      image: MyantonomoImage,
    },
  ];

  return (
      <div className="min-h-screen bg-background">
        {/* Hero header */}
        <div className="border-b border-border bg-card px-6 py-12 text-center shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-700">
            WPI Computer Science Department
          </p>
          <h1 className="mb-1 text-4xl font-bold tracking-tight text-foreground">
            CS3733-D26 Software Engineering
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Prof. Wilson Wong &nbsp;·&nbsp; Team Coach: Ayush Kulkarni
          </p>
        </div>

        {/* Team grid */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="mb-8 text-center text-lg font-semibold uppercase tracking-widest text-muted-foreground">
            Meet the Team
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {members.map((m) => (
                <div
                    key={m.title}
                    className="group flex flex-col items-center rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-hanover-green/30 ring-2 ring-offset-2 ring-hanover-green/10">
                    <img
                        src={m.image}
                        alt={m.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-center text-sm font-semibold text-foreground">{m.title}</p>
                  <p className="mt-0.5 text-center text-xs text-muted-foreground">{m.subtitle}</p>
                </div>
            ))}
          </div>
        </div>

        {/* Acknowledgement */}
        <div className="border-t border-border bg-muted/40 px-6 py-10 text-center">
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
            Special thanks to <span className="font-medium text-foreground">Hanover Insurance</span>{" "}
            and their representatives,{" "}
            <span className="font-medium text-foreground">Brandon Roche</span>, Deputy CIO, and{" "}
            <span className="font-medium text-foreground">Meaghan Jenket</span>, Principal Business
            Architect.
          </p>
        </div>
      </div>
  );
}

export default AboutPage;
