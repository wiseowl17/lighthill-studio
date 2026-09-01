import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("bg-bg pt-28 pb-10 md:pt-32 md:pb-14", className)}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          {eyebrow ? (
            <p className="text-[0.7rem] font-medium tracking-[0.22em] text-fg-muted uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-4 max-w-4xl font-display text-headline text-fg">
            {title}
          </h1>
          {lede ? (
            <p className="mt-6 max-w-2xl text-lead leading-relaxed text-fg-muted">
              {lede}
            </p>
          ) : null}
        </Reveal>
      </div>
      {image ? (
        <div className="mx-auto mt-12 max-w-7xl overflow-hidden px-5 md:mt-16 md:px-8">
          <Reveal>
            <div className="aspect-wide overflow-hidden bg-bg-elevated">
              <img
                src={image}
                alt={imageAlt ?? ""}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      ) : null}
    </section>
  );
}
