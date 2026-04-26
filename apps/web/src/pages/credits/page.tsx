
import LinkCard from "@/pages/content/components/LinkCard.tsx";

import NodeJSLogo from "@/assets/nodejslogo.png";
import PrismaLogo from "@/assets/prismalogo.png";
import PostgresLogo from "@/assets/postgresslogo.jpg";
import ReactLogo from "@/assets/reactlogo.png";
import SupabaseLogo from "@/assets/supabaselogo.jpg";
import TRPCLogo from "@/assets/trpclogo.png";
import ViteLogo from "@/assets/vitelogo.png";
import ExpressLogo from "@/assets/expressjslogo.jpg";




function CreditsPage(){
    const technologies=[
        {
            title:"Prisma",
            subtitle:"open source nodejs based orm",
            image:PrismaLogo,
            link:"https://prisma.io",
        },
        {
            title:"NodeJS",
            subtitle:"open source javascript runtime",
            image:NodeJSLogo,
            link:"https://nodejs.org",
        },
        {
            title:"PostgreSQL",
            subtitle:"open source sql relational database",
            image:PostgresLogo,
            link:"https://postgresql.org",
        },
        {
            title:"React",
            subtitle:"open source frontend web framework",
            image:ReactLogo,
            link:"https://react.dev/",
        },
        {
            title:"Supabase",
            subtitle:"gui web based postgreSQL hosting platform",
            image:SupabaseLogo,
            link:"https://supabase.com/",
        },
        {
            title:"TRPC",
            subtitle:"typesafe end to end api library",
            image:TRPCLogo,
            link:"https://trpc.io/",
        },
        {
            title:"Vite",
            subtitle:"local development server",
            image:ViteLogo,
            link:"https://vite.dev/",
        },
        {
            title:"ExpressJS",
            subtitle:"open source, Fast, unopinionated, minimalist web framework",
            image:ExpressLogo,
            link:"https://expressjs.com/",
        }


    ]
    return (
        <>
            <div className={"w-full flex justify-center-safe text-center m-4"}>
                <div className={"w-fit border-4 p-4"}>
                    <span>we used the pern stack, and additionally used prisma to access our database,</span>
                    <br/>
                    <span>TRPC for our apis, express for our server, postgress for our database, supabase</span>
                    <br/>
                    <span>for hosting our database and s3 bucket, and nodejs as our server runtime.</span>
                </div>
                <br/>
            </div>

            <div className={"flex gap-4 flex-wrap mt-4 ml-4"}>
            {technologies.map((t)=><LinkCard key={t.title} link={t.link} title={t.title} subtitle={t.subtitle} image={t.image}/>)}
        </div>
        </>

    )
}

export default CreditsPage;