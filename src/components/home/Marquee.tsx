import { marqueeItems } from "@data/services";

function MarqueeRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={hidden || undefined}
    >
      {marqueeItems.map((item) => (
        <span
          key={item}
          className="font-display text-2xl leading-none tracking-tight text-fg/80 italic md:text-4xl"
        >
          {item}
          <span className="ml-10 text-fg-subtle">/</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="marquee-mask overflow-hidden border-y border-border bg-bg-elevated py-6 md:py-8">
      <div className="marquee-track flex w-max items-center">
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  );
}
