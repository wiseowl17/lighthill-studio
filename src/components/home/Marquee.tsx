import { services } from "@data/services";
import { useI18n } from "@/lib/i18n/provider";

function MarqueeGroup({ hidden = false }: { hidden?: boolean }) {
  const { copy } = useI18n();
  const labels = services.map((service) => copy.services[service.id as keyof typeof copy.services].title);
  const items = [...labels, ...labels];
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
