import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { colorfulCreators, colorfulTickets, type ColorfulTicketId } from "@data/event";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/media/Photo";
import { money } from "@/lib/studio/catalog";
import { listEventTickets, startEventCheckout } from "@/lib/studio/ticket-fns";
import { dictionaries } from "@/lib/i18n/copy";
import { cn } from "@/lib/utils";

type Search = { cancelled?: boolean };
type StripeTicket = {
  productId: string;
  priceId: string;
  name: string;
  description: string | null;
  amountCents: number;
  image: string | null;
};

export const Route = createFileRoute("/colorful")({
  validateSearch: (search: Record<string, unknown>): Search => {
    if (search.cancelled === "1" || search.cancelled === true) return { cancelled: true };
    return {};
  },
  component: ColorfulPage,
  head: () => ({
    meta: [
      { title: "The Colorful Experience — Lighthill Studio" },
      {
        name: "description",
        content:
          "Lighthill Studio presenta The Colorful Experience en Atlanta. 26 de septiembre, 2–6 PM. Mini fotos, flash tattoos, bebidas y açaí.",
      },
    ],
  }),
});

function matchStripe(tickets: StripeTicket[], id: ColorfulTicketId): StripeTicket | undefined {
  const used = new Set<string>();
  const blob = (ticket: StripeTicket) => `${ticket.name} ${ticket.description ?? ""}`;
  const byName = (pattern: RegExp) =>
    tickets.find((ticket) => pattern.test(blob(ticket)) && !used.has(ticket.priceId));

  const full = byName(/full/i);
  if (full) used.add(full.priceId);
  const tattoo = byName(/tattoo|flash/i);
  if (tattoo) used.add(tattoo.priceId);
  const photo = byName(/photo/i);
  if (photo) used.add(photo.priceId);

  const mapped: Record<ColorfulTicketId, StripeTicket | undefined> = { full, tattoo, photo };
  if (mapped[id]) return mapped[id];

  const leftover = tickets
    .filter((ticket) => !used.has(ticket.priceId))
    .sort((a, b) => b.amountCents - a.amountCents);
  const fallback: Record<ColorfulTicketId, StripeTicket | undefined> = {
    full: leftover[0],
    tattoo: leftover[1],
    photo: leftover[2],
  };
  return fallback[id];
}

function ColorfulPage() {
  const { cancelled } = Route.useSearch();
  const copy = dictionaries.es;
  const [stripeTickets, setStripeTickets] = useState<StripeTicket[]>([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ColorfulTicketId>("full");
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    async function load() {
      try {
        const result = await listEventTickets();
        if (!live) return;
        setReady(result.ready);
        setStripeTickets(result.tickets);
      } catch {
        if (live) setReady(false);
      } finally {
        if (live) setLoading(false);
      }
    }
    void load();
    return () => {
      live = false;
    };
  }, []);

  const linked = useMemo(() => {
    const map = {} as Record<ColorfulTicketId, StripeTicket | undefined>;
    for (const pack of colorfulTickets) {
      map[pack.id] = matchStripe(stripeTickets, pack.id);
    }
    return map;
  }, [stripeTickets]);

  const chosenStripe = linked[selected];

  async function onBuy(event: FormEvent) {
    event.preventDefault();
    if (!chosenStripe) return;
    setPending(true);
    setError(null);
    try {
      const result = await startEventCheckout({
        data: { priceId: chosenStripe.priceId, quantity: qty },
      });
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo abrir el checkout.");
      setPending(false);
    }
  }

  return (
    <main id="main" lang="es" className="colorful-event pb-24">
      <section className="pt-24 md:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-12 md:px-8 md:py-16">
          <div className="md:col-span-5">
            <p className="ce-kicker text-[0.72rem] font-medium tracking-[0.22em] uppercase">
              {copy.event.eyebrow}
            </p>
            <h1 className="ce-title mt-4 font-display text-headline italic leading-[0.92]">
              {copy.event.title}
            </h1>
            <p className="ce-muted mt-5 max-w-md text-lead leading-relaxed">
              {copy.event.lede}
            </p>
            <dl className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="ce-kicker text-[0.68rem] tracking-[0.16em] uppercase">
                  {copy.event.whenLabel}
                </dt>
                <dd className="mt-1 font-display text-xl">{copy.event.when}</dd>
              </div>
              <div>
                <dt className="ce-kicker text-[0.68rem] tracking-[0.16em] uppercase">
                  {copy.event.whereLabel}
                </dt>
                <dd className="mt-1 font-display text-xl">{copy.event.where}</dd>
              </div>
            </dl>
            <p className="ce-title mt-6 text-[0.72rem] font-medium tracking-[0.16em] uppercase">
              {copy.event.limited}
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="overflow-hidden shadow-[0_18px_50px_rgb(28_23_20/0.12)]">
              <Photo
                src="/images/colorful/poster.jpg"
                alt="Lighthill Studio presents The Colorful Experience, September 26, 2 to 6 PM"
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="ce-kicker text-[0.72rem] font-medium tracking-[0.22em] uppercase">
            {copy.event.dayToCreate}
          </p>
          <h2 className="ce-title mt-3 font-display text-title italic">{copy.event.creators}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colorfulCreators.map((creator) => (
              <a
                key={creator.id}
                href={creator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden bg-white shadow-[0_10px_30px_rgb(28_23_20/0.08)]"
              >
                <Photo
                  src={creator.src}
                  alt={creator.alt}
                  className="h-auto w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="ce-kicker text-[0.72rem] font-medium tracking-[0.22em] uppercase">
            {copy.event.tickets}
          </p>
          <h2 className="ce-title mt-3 max-w-xl font-display text-title italic">
            {copy.event.ticketsLede}
          </h2>
          {cancelled ? (
            <p className="mt-6 max-w-xl border border-ink-border bg-white px-4 py-3 text-sm">
              {copy.event.cancelled}
            </p>
          ) : null}

          <form onSubmit={onBuy} className="mt-10">
            <div className="grid items-stretch gap-4 md:grid-cols-3">
              {colorfulTickets.map((pack) => {
                const text = copy.event.packages[pack.id];
                const stripe = linked[pack.id];
                const active = selected === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelected(pack.id)}
                    className={cn(
                      "flex h-full flex-col p-6 text-left transition-[transform,box-shadow] duration-200",
                      pack.tone === "sage" && "ticket-sage",
                      pack.tone === "sky" && "ticket-sky",
                      pack.tone === "rose" && "ticket-rose",
                      active
                        ? "scale-[1.01] shadow-[0_0_0_3px_var(--ce-ink)]"
                        : "shadow-[0_10px_24px_rgb(28_23_20/0.08)] hover:shadow-[0_0_0_2px_rgb(28_23_20/0.35)]",
                    )}
                  >
                    <p className="font-display text-2xl leading-tight">{text.name}</p>
                    <p className="mt-2 font-display text-4xl tracking-tight">
                      {stripe ? money(stripe.amountCents) : pack.priceLabel}
                    </p>
                    <ul className="mt-5 flex-1 space-y-2 text-sm leading-relaxed">
                      {text.includes.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--ce-red)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="ce-muted mt-8 max-w-3xl space-y-3 text-sm leading-relaxed">
              <p>{copy.event.tattooNote}</p>
              <p>{copy.event.photoNote}</p>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div>
                <label htmlFor="qty" className="ce-kicker text-xs tracking-[0.16em] uppercase">
                  {copy.event.qty}
                </label>
                <input
                  id="qty"
                  type="number"
                  min={1}
                  max={10}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                  className="mt-2 block h-12 w-24 border border-ink-border bg-white px-3 text-sm tabular-nums"
                />
              </div>
              <Button
                type="submit"
                variant="invert"
                size="lg"
                className="sm:min-w-56"
                disabled={pending || loading || !chosenStripe}
              >
                {pending
                  ? copy.event.buying
                  : chosenStripe
                    ? `${copy.event.buy} · ${money(chosenStripe.amountCents * qty)}`
                    : copy.event.buy}
              </Button>
            </div>
            {loading ? <p className="ce-muted mt-4 text-sm">{copy.event.loading}</p> : null}
            {!loading && !chosenStripe ? (
              <p className="ce-muted mt-4 text-sm">
                {ready ? copy.event.empty : copy.event.emptyHint}
              </p>
            ) : null}
            {error ? <p className="ce-title mt-3 text-sm">{error}</p> : null}
          </form>
        </div>
      </section>
    </main>
  );
}
