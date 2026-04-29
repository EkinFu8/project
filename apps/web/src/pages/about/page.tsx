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
    <div className="min-h-[calc(100vh-2.75rem)] bg-background">
      {/* Hero header */}
      <div className="border-b border-border bg-card px-4 py-8 text-center shadow-sm animate-fade-in-down sm:px-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-700">
          WPI Computer Science Department
        </p>
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          CS3733-D26 Software Engineering
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Prof. Wilson Wong &nbsp;·&nbsp; Team Coach: Ayush Kulkarni
        </p>
      </div>

      {/* Team grid */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="h-1 w-12 rounded-full bg-hanover-green" />
          <h2 className="text-center text-lg font-semibold uppercase tracking-widest text-muted-foreground">
            Meet the Team
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 stagger-children sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {members.map((m) => (
            <div
              key={m.title}
              className="group hover-lift flex flex-col items-center rounded-lg border border-border bg-card p-4 shadow-sm hover:border-hanover-green/40 hover:shadow-md"
            >
              <div className="mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-hanover-green/30 ring-2 ring-hanover-green/10 ring-offset-2 ring-offset-card transition-all duration-300 group-hover:border-hanover-green/60 group-hover:ring-hanover-green/20 sm:h-20 sm:w-20">
                <img
                  src={m.image}
                  alt={m.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <p className="text-center text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-hanover-green">
                {m.title}
              </p>
              <p className="mt-0.5 text-center text-xs text-muted-foreground">{m.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgement */}
      <div className="border-t border-border bg-muted/40 px-4 py-8 text-center sm:px-6">
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
