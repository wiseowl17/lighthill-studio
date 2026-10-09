import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, MapPin } from "lucide-react";
import { site } from "@data/site";
import { cocoween, cocoweenCards, cocoweenCopy as t, type Lang } from "@data/cocoween";

type Search = { session_id?: string; lang?: "en" };

// Flat file with an underscore on purpose: a nested event/confirmed.tsx
// would render inside /event (see HANDOFF.md, rule 10).
export const Route = createFileRoute("/event_/confirmed")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search.session_id === "string" ? { session_id: search.session_id } : {}),
    ...(search.lang === "en" ? { lang: "en" as const } : {}),
  }),
  component: Confirmed,
  head: () => ({
    meta: [
      { title: "You're in: Cocoween | Lighthill Studio" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

/** A one-event .ics so parents can drop the afternoon into their calendar. */
function icsHref(lang: Lang): string {
  const stamp = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const where = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lighthill Studio//Cocoween//EN",
    "BEGIN:VEVENT",
    `UID:cocoween-2026@lighthillstudio.com`,
    `DTSTAMP:${stamp(cocoween.startsAt)}`,
    `DTSTART:${stamp(cocoween.startsAt)}`,
    `DTEND:${stamp(cocoween.endsAt)}`,
    `SUMMARY:Cocoween · Lighthill Studio`,
    `LOCATION:${where.replace(/,/g, "\\,")}`,
    `DESCRIPTION:${t.thanksBody[lang].replace(/,/g, "\\,")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

function Confirmed() {
  const { lang: q } = Route.useSearch();
  const lang: Lang = q === "en" ? "en" : "es";
  const L = (b: { en: string; es: string }) => b[lang];

  return (
    <main id="main" lang={lang} className="loteria min-h-[80dvh]">
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-24 md:px-8">
        <h1 className="lot-wood text-[clamp(2.6rem,1.6rem+4vw,4.75rem)] leading-[0.95] text-[var(--lot-marigold)]">
          {L(t.thanksTitle)}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed">{L(t.thanksBody)}</p>

        <ul className="mt-10 grid grid-cols-3 gap-3 sm:gap-4" aria-label={L(t.tabla)}>
          {cocoweenCards.map((card) => (
            <li
              key={card.id}
              className="rounded-md border-[3px] border-[var(--lot-ink)] bg-[var(--lot-stock)] p-3 text-[var(--lot-ink)]"
            >
              <span className="lot-wood block text-xl leading-none text-[var(--lot-red)]">
                {card.number}
              </span>
              <span className="mt-2 block text-sm leading-snug">{L(card.caption)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={icsHref(lang)}
            download="cocoween.ics"
            className="inline-flex h-12 items-center gap-2 rounded-md border-[3px] border-[var(--lot-ink)] bg-[var(--lot-rosa)] px-5 font-medium text-white"
          >
            <CalendarPlus className="size-4" aria-hidden />
            {L(t.addCalendar)}
          </a>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-md border-2 border-[var(--lot-stock)] px-5 font-medium"
          >
            <MapPin className="size-4" aria-hidden />
            {L(t.directions)}
          </a>
          <Link
            to="/"
            className="inline-flex h-12 items-center px-2 text-[var(--lot-text-muted)] underline underline-offset-4"
          >
            {L(t.backHome)}
          </Link>
        </div>

        <p className="mt-12 text-sm text-[var(--lot-text-muted)]">
          {L(t.questions)}{" "}
          <a
            href={`tel:${site.phone}`}
            className="text-[var(--lot-text)] underline underline-offset-4"
          >
            {site.phoneDisplay}
          </a>
        </p>
      </section>
    </main>
  );
}
