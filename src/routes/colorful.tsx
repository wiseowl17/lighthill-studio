import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { colorfulEvent } from "@data/event";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/media/Photo";
import { money } from "@/lib/studio/catalog";
import { listEventTickets, startEventCheckout } from "@/lib/studio/ticket-fns";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Search = { cancelled?: boolean };
type Ticket = {
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
          "The Colorful Experience at Lighthill Studio on September 26, 2026. Choose a ticket and check out on Stripe.",
      },
    ],
  }),
});

function ColorfulPage() {
  const { cancelled } = Route.useSearch();
  const { copy } = useI18n();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ready, setReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>("");
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
        setTickets(result.tickets);
        setSelected(result.tickets[0]?.priceId ?? "");
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

  async function onBuy(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setPending(true);
    setError(null);
    try {
      const result = await startEventCheckout({ data: { priceId: selected, quantity: qty } });
      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setPending(false);
    }
  }

  const chosen = tickets.find((ticket) => ticket.priceId === selected);

  return (
    <main id="main">
      <PageHero
        eyebrow={copy.event.eyebrow}
        title={copy.event.title}
        lede={copy.event.lede}
        image="/images/gallery/cele-rainbow.jpg"
        imageAlt="The Colorful Experience at Lighthill Studio"
      />

      <section className="bg-paper text-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
          <div className="md:col-span-7">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                  {copy.event.whenLabel}
                </dt>
                <dd className="mt-2 font-display text-2xl">{copy.event.when}</dd>
              </div>
              <div>
                <dt className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                  {copy.event.whereLabel}
                </dt>
                <dd className="mt-2 font-display text-2xl">{copy.event.where}</dd>
              </div>
            </dl>
            <div className="mt-10 columns-2 gap-3">
              {colorfulEvent.photos.map((photo) => (
                <div key={photo.src} className="mb-3 break-inside-avoid overflow-hidden bg-paper-muted">
                  <Photo src={photo.src} alt={photo.alt} className="h-auto w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <aside className="md:col-span-5">
            <form
              onSubmit={onBuy}
              className="border border-ink-border bg-paper p-6 shadow-[var(--shadow-paper)] md:sticky md:top-28"
            >
              <p className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                {copy.event.tickets}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {copy.event.ticketsLede}
              </p>
              {cancelled ? (
                <p className="mt-4 border border-ink-border bg-paper-muted px-3 py-2 text-sm">
                  {copy.event.cancelled}
                </p>
              ) : null}

              {loading ? (
                <p className="mt-6 text-sm text-ink-muted">{copy.event.loading}</p>
              ) : tickets.length === 0 ? (
                <div className="mt-6 space-y-2 text-sm text-ink-muted">
                  <p>{copy.event.empty}</p>
                  {!ready ? <p>{copy.event.emptyHint}</p> : null}
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.priceId}
                      type="button"
                      onClick={() => setSelected(ticket.priceId)}
                      className={cn(
                        "w-full border px-4 py-4 text-left transition-colors",
                        selected === ticket.priceId
                          ? "border-ink bg-ink text-paper"
                          : "border-ink-border bg-paper text-ink hover:border-ink/40",
                      )}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-xl">{ticket.name}</span>
                        <span className="tabular-nums">{money(ticket.amountCents)}</span>
                      </span>
                      {ticket.description ? (
                        <span
                          className={cn(
                            "mt-2 block text-sm leading-relaxed",
                            selected === ticket.priceId ? "text-paper/70" : "text-ink-muted",
                          )}
                        >
                          {ticket.description}
                        </span>
                      ) : null}
                    </button>
                  ))}
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <label htmlFor="qty" className="text-sm text-ink-muted">
                      {copy.event.qty}
                    </label>
                    <input
                      id="qty"
                      type="number"
                      min={1}
                      max={10}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                      className="h-11 w-20 border border-ink-border bg-paper px-3 text-sm tabular-nums"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="invert"
                    size="lg"
                    className="w-full"
                    disabled={pending || !chosen}
                  >
                    {pending
                      ? copy.event.buying
                      : chosen
                        ? `${copy.event.buy} · ${money(chosen.amountCents * qty)}`
                        : copy.event.buy}
                  </Button>
                  {error ? <p className="text-sm text-ink-muted">{error}</p> : null}
                </div>
              )}
            </form>
          </aside>
        </div>
      </section>
    </main>
  );
}
