import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services } from "@data/services";
import { studioSpecs } from "@data/studio";
import { site } from "@data/site";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Reveal } from "@/components/motion/Reveal";
import { Photo } from "@/components/media/Photo";
import { useI18n } from "@/lib/i18n/provider";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Lighthill Studio — Lawrenceville, GA" },
      {
        name: "description",
        content: site.description,
      },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: "/images/hero-poster.webp",
        type: "image/webp",
      },
    ],
  }),
});

function Home() {
  const { copy } = useI18n();
  return (
    <main id="main">
      <Hero />
      <Link
        to="/colorful"
        className="flex items-center justify-between gap-4 border-b border-border bg-bg-elevated px-5 py-4 text-fg transition-colors hover:bg-bg md:px-8"
      >
        <span className="text-[0.72rem] font-medium tracking-[0.16em] uppercase">
          {copy.home.eventBanner}
        </span>
        <span className="inline-flex items-center gap-1 text-[0.72rem] tracking-[0.14em] uppercase">
          {copy.home.eventCta}
          <ArrowRight className="size-3.5" />
        </span>
      </Link>
      <Marquee />

      <section className="bg-paper text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-28">
          <Reveal className="md:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
              {copy.home.studioEyebrow}
            </p>
            <h2 className="mt-4 font-display text-headline">{copy.home.studioTitle}</h2>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-6 md:col-start-7">
            <p className="text-lead leading-relaxed text-ink-muted">{copy.home.studioP1}</p>
            <p className="mt-5 leading-relaxed text-ink-muted">{copy.home.studioP2}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="invert" size="lg" asChild>
                <Link to="/studio">
                  {copy.home.seeSpace}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button variant="paperOutline" size="lg" asChild>
                <Link to="/contact" search={{ type: "shoot" }}>
                  {copy.home.bookTeam}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg text-fg">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] text-fg-muted uppercase">
              {copy.home.inHouse}
            </p>
            <h2 className="mt-4 font-display text-headline">{copy.home.inHouseTitle}</h2>
            <p className="mt-5 text-fg-muted">{copy.home.inHouseLede}</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 items-stretch gap-3 lg:mt-14 lg:grid-cols-4 lg:gap-4">
            {services.map((service, i) => {
              const text = copy.services[service.id as keyof typeof copy.services];
              return (
                <Reveal key={service.id} delay={i * 0.03} className="h-full">
                  <Link
                    to="/contact"
                    search={{ type: "shoot" }}
                    className="group flex h-full flex-col overflow-hidden bg-bg-elevated"
                  >
                    <div className="aspect-portrait overflow-hidden">
                      <Photo
                        src={service.image}
                        alt={text.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        style={
                          service.objectPosition
                            ? { objectPosition: service.objectPosition }
                            : undefined
                        }
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <p className="hidden text-xs tracking-[0.16em] text-fg-subtle uppercase sm:block">
                        {text.kicker}
                      </p>
                      <h3 className="font-display text-lg leading-tight sm:mt-2 sm:text-2xl">
                        {text.title}
                      </h3>
                      <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-fg-muted sm:block">
                        {text.description}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-bg text-fg">
        <div className="absolute inset-0 -z-10">
          <Photo
            src="/images/cyclorama.jpg"
            alt=""
            className="h-full w-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-bg/55" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
          <Reveal className="md:col-span-7">
            <p className="text-xs font-medium tracking-[0.2em] text-fg-muted uppercase">
              {copy.studio.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-headline">{copy.studio.introTitle}</h2>
            <p className="mt-6 max-w-xl text-lead text-fg-muted">{copy.studio.introBody}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link to="/studio">{copy.home.tour}</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/rent">{copy.cta.rent}</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
            <dl className="divide-y divide-border border-y border-border">
              {studioSpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <dt className="text-xs tracking-[0.16em] text-fg-subtle uppercase">
                    {copy.studio.specs[spec.label as keyof typeof copy.studio.specs] ?? spec.label}
                  </dt>
                  <dd className="text-sm text-fg">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <SelectedWork />

      <section className="bg-paper text-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-end md:justify-between md:px-8 md:py-32">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-headline">{copy.home.readyTitle}</h2>
            <p className="mt-5 text-lead text-ink-muted">{copy.home.readyLede}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <Button variant="invert" size="lg" asChild>
              <Link to="/contact" search={{ type: "shoot" }}>
                {copy.home.startInquiry}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
