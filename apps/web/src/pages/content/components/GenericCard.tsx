type Props = {
  title: string;
  subtitle: string;
  image: string;
};
function GenericCard({ title, subtitle, image }: Props) {
  return (
    <div className="w-xs min-w-3xs group flex flex-col items-center rounded border bg-card p-5 shadow-sm transition-all hover:border-hanover-green hover:shadow-md">
      <img className="h-50 w-50 object-scale-down" src={image} alt={title} />
      <br />
      <span className="text-3xl font-bold">{title}</span>
      <br />
      <span className="text-base">{subtitle}</span>
    </div>
  );
}
export default GenericCard;
