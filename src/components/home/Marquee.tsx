import { marqueeItems } from "@data/services";

export function Marquee() {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div className="overflow-hidden border-y border-border bg-bg-elevated py-4">
      <div className="marquee-track flex w-max gap-10 pr-10">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-2xl tracking-tight text-fg/80 italic md:text-3xl"
          >
            {item}
            <span className="ml-10 text-fg-subtle">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
