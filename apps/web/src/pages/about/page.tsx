import { Quote, X } from "lucide-react";
import { useState } from "react";
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

type Member = {
  title: string;
  subtitle: string;
  image: string;
  quote: string;
};

function QuoteModal({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — button so it's interactive and keyboard accessible */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-label="Close modal"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${member.title}'s favorite quote`}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-hanover-green/40 ring-2 ring-hanover-green/10 ring-offset-2 ring-offset-card">
            <img src={member.image} alt={member.title} className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{member.title}</p>
            <p className="text-xs text-muted-foreground">{member.subtitle}</p>
          </div>
        </div>

        {/* Quote body */}
        <div className="px-6 py-6">
          <Quote className="mb-3 h-6 w-6 text-hanover-green/50" />
          <p className="text-sm leading-relaxed text-foreground italic">{member.quote}</p>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  const [selected, setSelected] = useState<Member | null>(null);

  const members: Member[] = [
    {
      title: "Rafael Mirzoyan",
      subtitle: "Project Manager",
      image: RafealImage,
      quote: "TODO: Add Rafael's favorite quote here.",
    },
    {
      title: "Colin Cotton",
      subtitle: "Documentation Analyst",
      image: ColinImage,
      quote: "TODO: Add Colin's favorite quote here.",
    },
    {
      title: "Jacob Major",
      subtitle: "Full Time Software Engineer",
      image: JacobMajorImage,
      quote: "TODO: Add Jacob Major's favorite quote here.",
    },
    {
      title: "Maxwell W.",
      subtitle: "Assistant Lead Software Engineer",
      image: MaxwellWImage,
      quote: "TODO: Add Maxwell's favorite quote here.",
    },
    {
      title: "Max C.",
      subtitle: "Full Time Software Engineer",
      image: MaxCImage,
      quote: "TODO: Add Max C.'s favorite quote here.",
    },
    {
      title: "Jacob Molnia",
      subtitle: "Lead Software Engineer",
      image: JacobMolniaImage,
      quote: "TODO: Add Jacob Molnia's favorite quote here.",
    },
    {
      title: "Tobias G.",
      subtitle: "Assistant Lead Software Engineer",
      image: TobiasImage,
      quote: "TODO: Add Tobias's favorite quote here.",
    },
    {
      title: "Ekin C.",
      subtitle: "Full Time Software Engineer",
      image: EkingsImage,
      quote: "TODO: Add Ekin's favorite quote here.",
    },
    {
      title: "Russell H.",
      subtitle: "Scrum Master",
      image: RusselsImage,
      quote: "TODO: Add Russell's favorite quote here.",
    },
    {
      title: "Myantonomo G.",
      subtitle: "Product Owner",
      image: MyantonomoImage,
      quote: "TODO: Add Myantonomo's favorite quote here.",
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
          <p className="text-xs text-muted-foreground">Click anyone to see their favorite quote</p>
        </div>
        <div className="grid grid-cols-2 gap-4 stagger-children sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {members.map((m) => (
            <button
              key={m.title}
              type="button"
              onClick={() => setSelected(m)}
              className="group hover-lift flex flex-col items-center rounded-lg border border-border bg-card p-4 shadow-sm hover:border-hanover-green/40 hover:shadow-md cursor-pointer text-left transition-all duration-200"
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
            </button>
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

      {/* Quote modal */}
      {selected && <QuoteModal member={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default AboutPage;
