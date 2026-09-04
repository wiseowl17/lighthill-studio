import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { dictionaries } from "@/lib/i18n/copy";

type Search = { session_id?: string };

export const Route = createFileRoute("/colorful_/confirmed")({
  validateSearch: (search: Record<string, unknown>): Search => {
    if (typeof search.session_id === "string" && search.session_id.length > 0) {
      return { session_id: search.session_id };
    }
    return {};
  },
  component: ConfirmedPage,
  head: () => ({
    meta: [{ title: "Boleto confirmado — The Colorful Experience" }],
  }),
});

function ConfirmedPage() {
  const copy = dictionaries.es;
  return (
    <main id="main" lang="es" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero eyebrow={copy.event.eyebrow} title={copy.event.confirmedTitle} lede={copy.event.confirmedLede} />
      </div>
      <section className="mx-auto max-w-2xl px-5 pt-12 md:px-8">
        <div className="border border-ink-border bg-paper p-8 shadow-[var(--shadow-paper)]">
          <span className="flex size-10 items-center justify-center rounded-full bg-ink text-paper">
            <Check className="size-5" strokeWidth={1.5} />
          </span>
          <p className="mt-6 text-sm leading-relaxed text-ink-muted">{copy.event.confirmedBody}</p>
          <div className="mt-8">
            <Button variant="invert" size="lg" asChild>
              <Link to="/">{copy.event.backHome}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
