export default function BrandText({ name }: { name: string }) {
  const words = name.trim().toLowerCase().split(/\s+/),
    main = words.length > 1 ? words.slice(0, -1).join(" ") : words[0],
    second = words.length > 1 ? words.at(-1) : "";
  return (
    <>
      <span className="brand-icon">∞</span>
      <span>
        {main}
        <span className="brand-second">
          {second}
          <span className="brand-dot">.</span>
        </span>
      </span>
    </>
  );
}
