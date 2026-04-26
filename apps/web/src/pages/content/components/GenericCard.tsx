

type Props={
    title:string;
    subtitle:string;
    image:string;
}
function GenericCard({title, subtitle, image}: Props) {
    return (
        <>
            <div className="w-xs min-w-3xs group rounded border flex flex-col items-center bg-card shadow-sm transition-all hover:border-hanover-green hover:shadow-md p-5">
                <img className="object-scale-down h-50 w-50" src={image} />
                <br/>
                <span className="text-3xl font-bold">{title}</span>
                <br/>
                <span className="text-base">{subtitle}</span>
            </div>
        </>
    );
}
export default GenericCard;