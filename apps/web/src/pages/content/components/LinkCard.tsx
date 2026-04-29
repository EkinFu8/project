type Props = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
};

function LinkCard({ title, subtitle, image, link }: Props) {
  return (
    <a
      href={link}
      className="w-xs min-w-3xs group flex flex-col items-center rounded border bg-card p-5 shadow-sm transition-all hover:border-hanover-green hover:shadow-md gap-4 no-underline text-inherit"
    >
      <img className="object-scale-down h-50 w-50" src={image} alt="" aria-hidden="true" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-3xl font-bold text-center">{title}</span>
        <span className="text-base text-center">{subtitle}</span>
      </div>
    </a>
  );
}

export default LinkCard;
