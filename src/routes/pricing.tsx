import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  addons,
  photographyPackages,
  rentalRates,
} from "@data/pricing";
import { site } from "@data/site";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Lighthill Studio" },
      {
        name: "description",
        content:
          "In-house photography packages and studio rental rates for Lighthill Studio in Lawrenceville, GA.",
      },
    ],
  }),
});

function PricingPage() {
  const { copy } = useI18n();
  return (
    <main id="main">
      <PageHero
        eyebrow={copy.pricing.eyebrow}
        title={copy.pricing.title}
        lede={copy.pricing.lede}
      />

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">
              {copy.pricing.inHouse}
            </p>
            <h2 className="mt-4 font-display text-headline">{copy.pricing.inHouseTitle}</h2>
          </Reveal>
          <div className="mt-12 grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photographyPackages.map((pkg) => (
              <article
                key={pkg.id}
                className={cn(
                  "flex h-full flex-col border p-7 shadow-[var(--shadow-paper)]",
                  pkg.featured
                    ? "border-ink bg-ink text-paper"
                    : "border-ink-border bg-paper text-ink",
                )}
              >
                <p
                  className={cn(
                    "text-[0.68rem] tracking-[0.16em] uppercase",
                    pkg.featured ? "text-paper/60" : "text-ink-muted",
                  )}
                >
                  {pkg.duration}
                </p>
                <h3 className="mt-3 font-display text-3xl">
                  {copy.packages[pkg.id as keyof typeof copy.packages] ?? pkg.name}
                </h3>
                <p className="mt-3 font-display text-4xl tracking-tight">
                  {copy.pricing.inquire}
                </p>
                <p
                  className={cn(
                    "mt-4 text-sm leading-relaxed",
                    pkg.featured ? "text-paper/75" : "text-ink-muted",
                  )}
                >
                  {pkg.description}
                </p>
                <ul
                  className={cn(
                    "mt-6 flex-1 space-y-2 text-sm",
                    pkg.featured ? "text-paper/80" : "text-ink-muted",
                  )}
                >
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-current" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    variant={pkg.featured ? "primary" : "invert"}
                    size="lg"
                    className="w-full"
                    asChild
                  >
                    <Link to="/contact" search={{ type: "shoot" }}>
                      {copy.pricing.writeUs}
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg text-fg">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="text-[0.7rem] tracking-[0.2em] text-fg-muted uppercase">
              {copy.pricing.rental}
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-headline">
              {copy.pricing.rentalTitle}
            </h2>
            <p className="mt-5 max-w-xl text-fg-muted">{copy.pricing.rentalLede}</p>
          </Reveal>

          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {rentalRates.map((rate) => (
              <div key={rate.id} className="bg-bg p-7">
                <p className="text-[0.68rem] tracking-[0.16em] text-fg-subtle uppercase">
                  {rate.name}
                </p>
                <p className="mt-3 font-display text-3xl">{rate.price}</p>
                <p className="mt-3 text-sm text-fg-muted">{rate.note}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-16 font-display text-title">{copy.pricing.addons}</h3>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="grid gap-2 py-6 md:grid-cols-12 md:items-baseline"
              >
                <p className="font-medium md:col-span-4">{addon.name}</p>
                <p className="text-sm text-fg-muted md:col-span-5">
                  {addon.description}
                </p>
                <p className="font-display text-xl tabular-nums md:col-span-3 md:text-right">
                  {addon.price}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" asChild>
              <Link to="/rent">{copy.cta.rent}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href={site.peerspaceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.cta.peerspace}
                <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <ul className="grid gap-4 text-sm leading-relaxed text-ink-muted md:grid-cols-2">
            {copy.pricing.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
