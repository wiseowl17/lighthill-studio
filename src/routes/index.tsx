import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services } from "@data/services";
import { studioIntro, studioSpecs } from "@data/studio";
import { site } from "@data/site";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Reveal } from "@/components/motion/Reveal";
import { Photo } from "@/components/media/Photo";

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
  return (
    <main id="main">
      <Hero />
      <Marquee />

      <section className="bg-paper text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-28">
          <Reveal className="md:col-span-5">
            <p className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">
              The studio
            </p>
            <h2 className="mt-4 font-display text-headline">
              An infinity wall. Controlled light. A floor that stays out of the way.
            </h2>
          </Reveal>
          <Reveal delay={0.08} className="md:col-span-6 md:col-start-7">
            <p className="text-lead leading-relaxed text-ink-muted">
              Lighthill is a 1,200 square-foot photography studio in
              Lawrenceville — just outside Atlanta. We built it first for our
              own sessions: maternity, newborns, brands, headshots, families,
              seasonals, celebrations, and podcasts. The cyclorama and the
              strobes are the reason the work looks the way it does.
            </p>
            <p className="mt-5 leading-relaxed text-ink-muted">
              When we are not on set, the room is available to other
              photographers, videographers, and small productions. Book the
              in-house team, or rent the space.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="invert" size="lg" asChild>
                <Link to="/studio">
                  See the space
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button variant="paperOutline" size="lg" asChild>
                <Link to="/contact" search={{ type: "shoot" }}>
                  Book the team
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
              In-house
            </p>
            <h2 className="mt-4 font-display text-headline">
              Directed sessions, in a room we know.
            </h2>
            <p className="mt-5 text-fg-muted">
              Start with the team. If you already have a photographer, rent the
              studio by the hour.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 items-stretch gap-3 lg:mt-14 lg:grid-cols-4 lg:gap-4">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.03} className="h-full">
                <Link
                  to="/pricing"
                  className="group flex h-full flex-col overflow-hidden bg-bg-elevated"
                >
                  <div className="aspect-portrait overflow-hidden">
                    <Photo
                      src={service.image}
                      alt={service.title}
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
                      {service.kicker}
                    </p>
                    <h3 className="font-display text-lg leading-tight sm:mt-2 sm:text-2xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 hidden flex-1 text-sm leading-relaxed text-fg-muted sm:block">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
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
              {studioIntro.eyebrow}
            </p>
            <h2 className="mt-4 font-display text-headline">{studioIntro.title}</h2>
            <p className="mt-6 max-w-xl text-lead text-fg-muted">
              {studioIntro.body}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link to="/studio">Tour the studio</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/rent">Rent now</Link>
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
                    {spec.label}
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
            <h2 className="font-display text-headline">
              Ready when you are.
            </h2>
            <p className="mt-5 text-lead text-ink-muted">
              Tell us about the session. We will come back with dates, a brief,
              and a clear next step — in-house or a rental.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Button variant="invert" size="lg" asChild>
              <Link to="/contact" search={{ type: "shoot" }}>
                Start an inquiry
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
