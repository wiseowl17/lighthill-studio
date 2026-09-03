import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/studio/catalog";
import { confirmRentalCheckout } from "@/lib/studio/rental-fns";

export const Route = createFileRoute("/rent/confirmed")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: ConfirmedPage,
  head: () => ({
    meta: [{ title: "Rental confirmed — Lighthill Studio" }],
  }),
});

function ConfirmedPage() {
  const { session_id: sessionId } = Route.useSearch();
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ok"; when: string; totalCents: number; depositCents: number }
    | { status: "error" }
  >({ status: "loading" });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error" });
      return;
    }
    void confirmRentalCheckout({ data: { sessionId } })
      .then((result) => {
        if (result.ok) {
          setState({
            status: "ok",
            when: result.when,
            totalCents: result.totalCents,
            depositCents: result.depositCents,
          });
        } else {
          setState({ status: "error" });
        }
      })
      .catch(() => setState({ status: "error" }));
  }, [sessionId]);

  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="Studio rental"
          title={
            state.status === "ok"
              ? "You’re on the floor."
              : state.status === "loading"
                ? "Confirming the deposit…"
                : "We could not confirm that checkout."
          }
          lede={
            state.status === "ok"
              ? "The 50% deposit is in. A confirmation sits on the studio calendar."
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
              Confirmed
            </p>
            <h2 className="mt-2 font-display text-3xl">{state.when}</h2>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Deposit paid</dt>
                <dd className="tabular-nums">{money(state.depositCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Balance on the day</dt>
                <dd className="tabular-nums">{money(state.totalCents - state.depositCents)}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">
              Address and entry notes go out by email. Bring the remaining balance when you
              arrive. Leave the cyclorama as you found it.
            </p>
            <Button variant="invert" size="lg" className="mt-8" asChild>
              <Link to="/">Back to the studio</Link>
            </Button>
          </div>
        ) : state.status === "error" ? (
          <Button variant="invert" size="lg" asChild>
            <Link to="/rent">Try Rent now again</Link>
          </Button>
        ) : (
          <p className="text-sm text-ink-muted">One moment.</p>
        )}
      </section>
    </main>
  );
}
