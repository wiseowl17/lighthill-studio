import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { site } from "@data/site";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/studio/catalog";
import { confirmRentalCheckout } from "@/lib/studio/rental-fns";

type Search = { session_id?: string };

export const Route = createFileRoute("/rent_/confirmed")({
  validateSearch: (search: Record<string, unknown>): Search => {
    if (typeof search.session_id === "string" && search.session_id.length > 0) {
      return { session_id: search.session_id };
    }
    return {};
  },
  component: ConfirmedPage,
  head: () => ({
    meta: [{ title: "Rental confirmed — Lighthill Studio" }],
  }),
});

type Details = {
  when: string;
  name: string | null;
  hours: number;
  guests: number | null;
  totalCents: number;
  depositCents: number;
  balanceCents: number;
};

function ConfirmedPage() {
  const { session_id: sessionId } = Route.useSearch();
  const paid = Boolean(sessionId);
  const [details, setDetails] = useState<Details | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let live = true;
    async function load() {
      try {
        const result = await confirmRentalCheckout({ data: { sessionId: sessionId as string } });
        if (live && result.ok) {
          setDetails({
            when: result.when,
            name: result.name,
            hours: result.hours,
            guests: result.guests,
            totalCents: result.totalCents,
            depositCents: result.depositCents,
            balanceCents: result.balanceCents,
          });
        }
      } catch {
        /* Stripe already took the deposit. Keep the thank-you on screen. */
      }
    }
    void load();
    return () => {
      live = false;
    };
  }, [sessionId]);

  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="Studio rental"
          title={paid ? "You’re booked." : "Looking for a confirmation?"}
          lede={
            paid
              ? "The 50% deposit is in. Stripe emails the receipt. The rest is due when you walk in."
              : "If you just paid, check the email on the card for a Stripe receipt."
          }
        />
      </div>
      <section className="mx-auto max-w-2xl px-5 pt-12 md:px-8">
        <div className="border border-ink-border bg-paper p-8 shadow-[var(--shadow-paper)]">
          <span className="flex size-10 items-center justify-center rounded-full bg-ink text-paper">
            <Check className="size-5" strokeWidth={1.5} />
          </span>
          <p className="mt-6 text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
            {paid ? "Confirmation" : "Receipt"}
          </p>
          <h2 className="mt-2 font-display text-3xl">
            {details?.when ?? (paid ? "Lighthill Studio rental" : "No checkout found")}
          </h2>
          {details ? (
            <p className="mt-2 text-sm text-ink-muted">
              {details.name ? `${details.name} · ` : ""}
              {details.hours} hr
              {details.guests ? ` · ${details.guests} guests` : ""}
            </p>
          ) : null}
          {details ? (
            <dl className="mt-6 space-y-2 border-t border-ink-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Studio total</dt>
                <dd className="tabular-nums">{money(details.totalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Deposit paid</dt>
                <dd className="tabular-nums">{money(details.depositCents)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Balance due at the studio</dt>
                <dd className="tabular-nums">{money(details.balanceCents)}</dd>
              </div>
            </dl>
          ) : paid ? (
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              A Stripe receipt is on its way to the email you used at checkout. Bring the remaining
              50% when you arrive.
            </p>
          ) : (
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              If Stripe already charged the card, write us with the receipt and we will lock the
              time.
            </p>
          )}
          {details ? (
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              An invoice for the remaining {money(details.balanceCents)} is on the desk. Address and
              entry notes will come from {site.contactEmail}.
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Leave the cyclorama as you found it. Tape and clamps are fine; no glitter, no paint.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="invert" size="lg" asChild>
              <Link to="/">Back to the studio</Link>
            </Button>
            <Button variant="paperOutline" size="lg" asChild>
              <a href={`mailto:${site.contactEmail}`}>Write the studio</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
