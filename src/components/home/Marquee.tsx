import { marqueeItems } from "@data/services";

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  const items = [...marqueeItems, ...marqueeItems];
  return (
    <div
      className="flex shrink-0 items-center gap-x-12 pr-12"
      aria-hidden={hidden || undefined}
    >
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="font-display text-[1.65rem] leading-[1.35] tracking-tight text-fg/80 italic whitespace-nowrap md:text-4xl md:leading-[1.35]"
        >
          {item}
          <span className="ml-12 text-fg-subtle">/</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-border bg-bg-elevated py-7 md:py-9">
      <div className="marquee-track flex w-max items-center">
        <MarqueeGroup />
        <MarqueeGroup hidden />
      </div>
    </div>
  );
}
