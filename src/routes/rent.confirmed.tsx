import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { site } from "@data/site";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/studio/catalog";
import { confirmRentalCheckout } from "@/lib/studio/rental-fns";

export const Route = createFileRoute("/rent/confirmed")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => {
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

type Confirmed = {
  status: "ok";
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
  const [state, setState] = useState<{ status: "loading" } | Confirmed | { status: "error" }>({
    status: "loading",
  });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error" });
      return;
    }
    let live = true;
    async function confirm() {
      try {
        let result = await confirmRentalCheckout({ data: { sessionId: sessionId as string } });
        if (!result.ok) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          result = await confirmRentalCheckout({ data: { sessionId: sessionId as string } });
        }
        if (!live) return;
        if (result.ok) {
          setState({
            status: "ok",
            when: result.when,
            name: result.name,
            hours: result.hours,
            guests: result.guests,
            totalCents: result.totalCents,
            depositCents: result.depositCents,
            balanceCents: result.balanceCents,
          });
        } else {
          setState({ status: "error" });
        }
      } catch {
        if (live) setState({ status: "error" });
      }
    }
    void confirm();
    return () => {
      live = false;
    };
  }, [sessionId]);

  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="Studio rental"
          title={
            state.status === "ok"
              ? "You’re booked."
              : state.status === "loading"
                ? "Confirming the deposit…"
                : "We could not confirm that checkout."
          }
          lede={
            state.status === "ok"
              ? "The 50% deposit is in. The rest is due when you walk in."
              : state.status === "loading"
                ? "Stripe is handing the booking back to the desk."
                : "If you were charged, write us with the receipt and we will lock the time."
          }
        />
      </div>
      <section className="mx-auto max-w-2xl px-5 pt-12 md:px-8">
        {state.status === "ok" ? (
          <div className="border border-ink-border bg-paper p-8 shadow-[var(--shadow-paper)]">
            <span className="flex size-10 items-center justify-center rounded-full bg-ink text-paper">
              <Check className="size-5" strokeWidth={1.5} />
            </span>
            <p className="mt-6 text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
              Confirmation
            </p>
            <h2 className="mt-2 font-display text-3xl">{state.when}</h2>
            <p className="mt-2 text-sm text-ink-muted">
              {state.name ? `${state.name} · ` : ""}
              {state.hours} hr
              {state.guests ? ` · ${state.guests} guests` : ""}
            </p>
            <dl className="mt-6 space-y-2 border-t border-ink-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Studio total</dt>
                <dd className="tabular-nums">{money(state.totalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Deposit paid</dt>
                <dd className="tabular-nums">{money(state.depositCents)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Balance due at the studio</dt>
                <dd className="tabular-nums">{money(state.balanceCents)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              An invoice for the remaining {money(state.balanceCents)} is on the desk.
              Bring that balance when you arrive. Address and entry notes will come from{" "}
              {site.contactEmail}.
            </p>
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
        ) : state.status === "error" ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              If Stripe already charged the card, the hold is on the calendar. Email us and we will
              send confirmation.
            </p>
            <Button variant="invert" size="lg" asChild>
              <Link to="/rent">Back to Rent now</Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">One moment.</p>
        )}
      </section>
    </main>
  );
}
