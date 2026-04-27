import ColinImage from "@/assets/colin.png";
import EkingsImage from "@/assets/ekin.png";
import JacobMajorImage from "@/assets/jacob major.png";
import JacobMolniaImage from "@/assets/jacob molnia.png";
import MaxCImage from "@/assets/max c.png";
import MaxwellWImage from "@/assets/maxwell w.png";
import MyantonomoImage from "@/assets/myantonomo.png";
import RafealImage from "@/assets/rafael.png";
import RusselsImage from "@/assets/russel.png";
import TobiasImage from "@/assets/tobias.jpg";
import GenericCard from "@/pages/content/components/GenericCard.tsx";

function AppPage() {
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
      subtitle: "assistant Lead Software Engineer",
      image: TobiasImage,
    },
    {
      title: "Ekin C",
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
    <>
      <br />
      <div className={"w-full flex justify-center-safe text-center m-4"}>
        <div className={"w-fit border-4 p-4"}>
          <span className="text-3xl font-bold">WPI Computer Science Department</span>
          <br />
          <span>CS3733-D26 Software Engineering</span>
          <br />
          <span>Prof. Wilson Wong</span>
          <br />
          <span>Team Coach: placeholder</span>
        </div>
      </div>

      <br />
      <div className="w-full ml-4 flex gap-5 flex-wrap">
        {members.map((m) => (
          <GenericCard key={m.title} title={m.title} subtitle={m.subtitle} image={m.image} />
        ))}
      </div>

      <br />
      <div className={"w-full flex justify-center-safe text-center m-4"}>
        <div className={"w-fit border-4 p-4"}>
          <span>
            Thank you Hanover Insurance and their representatives, Brandon Roche, Deputy CIO, and
            Meaghan Jenket, Principle Business Architect.
          </span>
        </div>
      </div>
    </>
  );
}

export default AppPage;
