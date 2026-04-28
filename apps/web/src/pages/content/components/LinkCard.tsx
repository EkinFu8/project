type Props = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
};
function LinkCard({ title, subtitle, image, link }: Props) {
  const handleClick = () => {
    window.location.href = link;
  };
  return (
    <>
      <div
        onClick={handleClick}
        className="w-xs cursor-pointer min-w-3xs group rounded border flex flex-col items-center bg-card shadow-sm transition-all hover:border-hanover-green hover:shadow-md p-5"
      >
        <img className="object-scale-down h-50 w-50" src={image} />
        <br />
        <span className="text-3xl font-bold">{title}</span>
        <br />
        <span className="text-base justify-center-safe text-center">{subtitle}</span>
      </div>
    </>
  );
}
export default LinkCard;
