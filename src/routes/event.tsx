import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Minus, Plus } from "lucide-react";
import { site } from "@data/site";
import {
  cocoween,
  cocoweenCards,
  cocoweenCopy as t,
  cocoweenIsOn,
  type Lang,
} from "@data/cocoween";
import { Photo } from "@/components/media/Photo";
import { money } from "@/lib/studio/catalog";
import { todayInTz } from "@/lib/studio/time";
import { getEventTicketFn, startEventTicketCheckoutFn } from "@/lib/studio/ticket-fns";
import { eventJsonLd, pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

/** Spanish is the page default (owner decision); ?lang=en switches to English. */
type Search = { cancelled?: boolean; lang?: "en" };

export const Route = createFileRoute("/event")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(search.cancelled === "1" || search.cancelled === true ? { cancelled: true } : {}),
    ...(search.lang === "en" ? { lang: "en" as const } : {}),
  }),
  component: EventPage,
  head: () => ({
    ...pageHead({
      path: "/event",
      title: "Cocoween: Halloween y Día de los Muertos para niños, 31 oct | Lighthill Studio",
      description:
        "Cocoween en Lighthill Studio, Lawrenceville, GA: sábado 31 de octubre, 1–4 PM. Pinta tu cerámica con Fluffy Bee Ceramics, mini sesión de fotos y 3 fotos digitales editadas. $60 por niño. English version available.",
    }),
    scripts: [eventJsonLd()],
  }),
});

const LETTER_COLORS = [
  "var(--lot-marigold)",
  "var(--lot-rosa)",
  "var(--lot-turquesa)",
  "var(--lot-violeta)",
];
const DEAL_TILT = [-5, 1, 6];

function EventPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/event" });
  const lang: Lang = search.lang === "en" ? "en" : "es";
  const L = (b: { en: string; es: string }) => b[lang];

  const [held, setHeld] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onSale, setOnSale] = useState<boolean | null>(null);
  const on = cocoweenIsOn(todayInTz());

  useEffect(() => {
    let live = true;
    void getEventTicketFn({ data: { eventKey: cocoween.key } })
      .then((r) => live && setOnSale(Boolean(r.ready && r.ticket)))
      .catch(() => live && setOnSale(false));
    return () => {
      live = false;
    };
  }, []);

  const toggleLang = () =>
    void navigate({
      search: (prev) => ({ ...prev, lang: lang === "es" ? ("en" as const) : undefined }),
      replace: true,
      resetScroll: false,
    });

  async function buy() {
    setPending(true);
    setError(null);
    try {
      const { url } = await startEventTicketCheckoutFn({
        data: { eventKey: cocoween.key, quantity: qty, lang },
      });
      window.location.assign(url);
    } catch {
      setError(L(t.unavailable));
      setPending(false);
    }
  }

  const heldCard = cocoweenCards.find((c) => c.id === held);
  const buyProps = { lang, qty, setQty, pending, onSale, on, buy, error };

  return (
    <main id="main" lang={lang} className="loteria pb-28 lg:pb-0">
      {/* First viewport: title beside the tabla, facts and action on its frame. */}
      <section className="mx-auto max-w-7xl px-5 pt-28 pb-14 md:px-8 md:pt-32 lg:pb-20">
        {search.cancelled ? (
          <p className="mb-6 rounded-md border border-[var(--lot-stock-shade)] px-4 py-3 text-sm">
            {L(t.cancelled)}
          </p>
        ) : null}

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h1
              aria-label="Cocoween"
              className="lot-wood text-[clamp(2.9rem,0.4rem+10.5vw,6rem)] lg:text-[clamp(3.5rem,0.2rem+5.2vw,6rem)] leading-[0.9] tracking-[-0.01em]"
            >
              {"COCOWEEN".split("").map((ch, i) => (
                <span
                  key={i}
                  aria-hidden
                  style={{ color: LETTER_COLORS[i % LETTER_COLORS.length] }}
                >
                  {ch}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-snug text-[var(--lot-text)] md:text-xl">
              {L(t.subtitle)}
            </p>
            <p className="mt-3 text-sm tracking-[0.12em] text-[var(--lot-text-muted)] uppercase">
              {L(t.presents)} · {site.address.city}, {site.address.region}
            </p>
            <button
              type="button"
              onClick={toggleLang}
              lang={lang === "es" ? "en" : "es"}
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--lot-stock)] px-5 text-sm font-medium transition-colors hover:bg-[var(--lot-stock)] hover:text-[var(--lot-ink)]"
            >
              <span aria-hidden className="text-base">
                {lang === "es" ? "EN" : "ES"}
              </span>
              {L(t.langSwitch)}
            </button>
          </div>

          <div className="lg:col-span-6">
            <p className="mb-4 text-sm text-[var(--lot-text-muted)]">{L(t.tabla)}</p>
            <div
              className="lot-deck grid grid-cols-3 gap-3 sm:gap-5"
              data-holding={held ? "true" : "false"}
            >
              {cocoweenCards.map((card, i) => (
                <button
                  key={card.id}
                  type="button"
                  data-field={card.field}
                  aria-pressed={held === card.id}
                  aria-controls="lot-detail"
                  onClick={() => setHeld((h) => (h === card.id ? null : card.id))}
                  className="lot-card lot-deal"
                  style={
                    {
                      "--deal-delay": `${120 + i * 110}ms`,
                      "--deal-from": `${DEAL_TILT[i] * 2}deg`,
                      transform: `rotate(${DEAL_TILT[i]}deg)`,
                    } as CSSProperties
                  }
                >
                  <span className="lot-card__inner">
                    <span className="lot-card__window">
                      <span className="lot-card__number" aria-hidden>
                        {card.number}
                      </span>
                      <Photo
                        src={card.image}
                        alt=""
                        loading="eager"
                        className={cn(
                          "h-full w-full",
                          card.fit === "contain" ? "object-contain px-1" : "object-cover",
                        )}
                      />
                    </span>
                    <span className="lot-card__title">{card.title}</span>
                  </span>
                  <span className="sr-only">: {L(card.caption)}</span>
                </button>
              ))}
            </div>
            {/* One card held at a time; its detail reads here. Fixed height, no jump. */}
            <div id="lot-detail" aria-live="polite" className="mt-6 min-h-[4.5rem]">
              {heldCard ? (
                <p className="text-base leading-relaxed">
                  <span className="lot-wood text-[var(--lot-marigold)]">
                    {heldCard.number}. {L(heldCard.caption)}.
                  </span>{" "}
                  <span className="text-[var(--lot-text-muted)]">{L(heldCard.detail)}</span>
                </p>
              ) : (
                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--lot-text-muted)]">
                  {cocoweenCards.map((c) => (
                    <li key={c.id}>
                      <span className="text-[var(--lot-text)]">{c.number}.</span> {L(c.caption)}
                    </li>
                  ))}
                  <li className="w-full pt-1 text-xs">{L(t.tapCard)}</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        <TablaFrame {...buyProps} className="mt-10 lg:mt-14" />
      </section>

      {/* The owners' own flyer beside what parents need to know. */}
      <div
        className="lot-picado"
        style={{ "--edge": "var(--lot-marigold)" } as CSSProperties}
        aria-hidden
      />
      <section className="mx-auto grid max-w-7xl items-start gap-12 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
        <div className="md:col-span-5">
          <div className="rotate-[-2deg] rounded-md border-4 border-[var(--lot-stock)] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)]">
            <Photo
              src={cocoween.flyers[lang]}
              alt={
                lang === "es"
                  ? "Flyer de Cocoween: 31 de octubre, 1 a 4 PM, $60 por niño"
                  : "Cocoween flyer: October 31, 1 to 4 PM, $60 per child"
              }
              sizes="(min-width: 768px) 40vw, 100vw"
              width={1206}
              height={1497}
              className="h-auto w-full rounded-[3px]"
            />
          </div>
          <a
            href={cocoween.flyers[lang === "es" ? "en" : "es"]}
            target="_blank"
            rel="noopener noreferrer"
            lang={lang === "es" ? "en" : "es"}
            className="mt-6 inline-block text-[var(--lot-marigold)] underline underline-offset-4 hover:text-[var(--lot-text)]"
          >
            {L(t.otherFlyer)}
          </a>
        </div>
        <div className="md:col-span-7 lg:col-span-6 lg:col-start-7">
          <h2 className="lot-wood text-[clamp(2rem,1.3rem+2.6vw,3.25rem)] leading-tight">
            {L(t.knowTitle)}
          </h2>
          <dl className="mt-8 grid gap-y-7">
            {t.know.map((item) => (
              <div key={item.q.en} className="border-t-2 border-[var(--lot-stock-shade)]/40 pt-5">
                <dt className="text-lg font-medium">{L(item.q)}</dt>
                <dd className="mt-2 leading-relaxed text-[var(--lot-text-muted)]">{L(item.a)}</dd>
              </div>
            ))}
            <div className="border-t-2 border-[var(--lot-stock-shade)]/40 pt-5">
              <dt className="text-lg font-medium">{cocoween.partner.name}</dt>
              <dd className="mt-2 leading-relaxed text-[var(--lot-text-muted)]">
                {lang === "es"
                  ? "La pintura de cerámica es con nuestras amigas de Fluffy Bee Ceramics."
                  : "Ceramic painting is with our friends at Fluffy Bee Ceramics."}
              </dd>
            </div>
          </dl>
          <p className="mt-10 text-[var(--lot-text-muted)]">
            {L(t.questions)}{" "}
            <a
              href={`tel:${site.phone}`}
              className="text-[var(--lot-text)] underline underline-offset-4"
            >
              {site.phoneDisplay}
            </a>
          </p>
        </div>
      </section>

      {/* Close */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <h2 className="lot-wood text-[clamp(2.4rem,1.4rem+4vw,5rem)] leading-none">
          {L(t.closeTitle)}
        </h2>
        <TablaFrame {...buyProps} className="mt-10" />
      </section>

      {/* Phone: the action stays under the thumb. */}
      {on ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-[var(--lot-stock)] bg-[var(--lot-night-2)] lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <p className="px-4 pt-2 text-center text-xs text-[var(--lot-text-muted)]">
            {L(t.date)} · {L(t.time)} ·{" "}
            <span className="text-[var(--lot-marigold)]">
              {money(cocoween.priceCents).replace(".00", "")} {L(t.perChild)}
            </span>
          </p>
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pt-2 pb-3">
            <Counter lang={lang} qty={qty} setQty={setQty} compact />
            <CallButton {...buyProps} className="flex-1" />
          </div>
        </div>
      ) : null}
    </main>
  );
}

type BuyProps = {
  lang: Lang;
  qty: number;
  setQty: (n: number) => void;
  pending: boolean;
  onSale: boolean | null;
  on: boolean;
  buy: () => void;
  error: string | null;
};

function TablaFrame({ className, ...p }: BuyProps & { className?: string }) {
  const L = (b: { en: string; es: string }) => b[p.lang];
  return (
    <div
      className={cn("lot-frame grid gap-6 p-5 md:p-7 lg:grid-cols-12 lg:items-center", className)}
    >
      <ul className="grid gap-4 sm:grid-cols-[auto_auto] sm:justify-start sm:gap-x-12 lg:col-span-7">
        <Fact icon={<CalendarDays className="size-5" aria-hidden />} label={L(t.date)} />
        <Fact icon={<Clock className="size-5" aria-hidden />} label={L(t.time)} sub={L(t.walkIn)} />
        <Fact
          className="sm:col-start-2 sm:row-span-2 sm:row-start-1"
          icon={<MapPin className="size-5" aria-hidden />}
          label={
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap underline underline-offset-4"
            >
              {site.address.street}
            </a>
          }
          sub={`${site.address.city}, ${site.address.region} ${site.address.postalCode}`}
        />
      </ul>
      <div className="flex flex-wrap items-center gap-5 lg:col-span-5 lg:justify-end">
        <div className="lot-seal size-24 shrink-0 text-center">
          <span>
            <span className="lot-wood block text-3xl leading-none">
              {money(cocoween.priceCents).replace(".00", "")}
            </span>
            <span className="block text-[0.72rem] font-medium uppercase">{L(t.perChild)}</span>
          </span>
        </div>
        {p.on ? (
          <div className="flex flex-1 flex-col gap-3">
            <Counter lang={p.lang} qty={p.qty} setQty={p.setQty} />
            <CallButton {...p} />
            <p className="text-xs text-[var(--lot-text-muted)]" aria-live="polite">
              {p.error ??
                `${L(t.limited)} · ${L(t.total)} ${money(cocoween.priceCents * p.qty).replace(".00", "")}`}
            </p>
          </div>
        ) : (
          <p className="flex-1 text-[var(--lot-text-muted)]">{L(t.over)}</p>
        )}
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  sub,
  className,
}: {
  icon: ReactNode;
  label: ReactNode;
  sub?: string;
  className?: string;
}) {
  return (
    <li className={cn("flex gap-3", className)}>
      <span className="mt-0.5 text-[var(--lot-marigold)]">{icon}</span>
      <span>
        <span className="block font-medium">{label}</span>
        {sub ? <span className="block text-sm text-[var(--lot-text-muted)]">{sub}</span> : null}
      </span>
    </li>
  );
}

function Counter({
  lang,
  qty,
  setQty,
  compact,
}: {
  lang: Lang;
  qty: number;
  setQty: (n: number) => void;
  compact?: boolean;
}) {
  const label = cocoweenCopy(lang);
  return (
    <div className="flex items-center gap-3">
      {compact ? null : <span className="text-sm text-[var(--lot-text-muted)]">{label}</span>}
      <div
        className="flex items-center rounded-full border-2 border-[var(--lot-stock)]"
        role="group"
        aria-label={label}
      >
        <button
          type="button"
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={qty <= 1}
          aria-label={lang === "es" ? "Un niño menos" : "One fewer child"}
          className="flex size-11 items-center justify-center disabled:opacity-40"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="lot-wood w-8 text-center text-xl tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty(Math.min(20, qty + 1))}
          disabled={qty >= 20}
          aria-label={lang === "es" ? "Un niño más" : "One more child"}
          className="flex size-11 items-center justify-center disabled:opacity-40"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function cocoweenCopy(lang: Lang) {
  return t.children[lang];
}

function CallButton({ lang, pending, onSale, buy, className }: BuyProps & { className?: string }) {
  const unavailable = onSale === false;
  return unavailable ? (
    <a
      href={`tel:${site.phone}`}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-md border-2 border-[var(--lot-stock)] px-5 text-center text-sm font-medium",
        className,
      )}
    >
      {t.unavailable[lang]}
    </a>
  ) : (
    <button
      type="button"
      onClick={buy}
      disabled={pending || onSale === null}
      className={cn(
        "lot-wood inline-flex min-h-12 items-center justify-center rounded-md border-[3px] border-[var(--lot-ink)] bg-[var(--lot-rosa)] px-6 text-lg text-white transition-[transform,background-color] hover:bg-[#c9006d] active:scale-[0.98] disabled:opacity-60",
        className,
      )}
    >
      {pending ? t.calling[lang] : t.call[lang]}
    </button>
  );
}
