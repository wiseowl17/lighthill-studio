import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@data/site";
import { services } from "@data/services";
import { googleRating } from "@data/reviews";
import { Star } from "lucide-react";
import { ContactForm, type InquiryType } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/layout/PageHero";
import { EmailLink, InstagramLink, PhoneLink } from "@/components/layout/ContactLinks";
import { useI18n } from "@/lib/i18n/provider";
import { canonical } from "@/lib/seo";

type ContactSearch = {
  type?: InquiryType;
  /** A data/services.ts id, set by the homepage service cards. */
  service?: string;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    type: search.type === "rental" || search.type === "shoot" ? search.type : undefined,
    service: services.some((s) => s.id === search.service) ? (search.service as string) : undefined,
  }),
  component: ContactPage,
  head: () => ({
    links: [canonical("/contact")],
    meta: [
      { title: "Book a Photo Shoot in Lawrenceville, GA | Lighthill Studio" },
      {
        name: "description",
        content:
          "Book an in-house photography session or inquire about renting Lighthill Studio in Lawrenceville, GA.",
      },
    ],
  }),
});

function ContactPage() {
  const { type, service } = Route.useSearch();
  const { copy } = useI18n();

  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow={copy.contact.eyebrow}
          title={copy.contact.title}
          lede={copy.contact.lede}
        />
      </div>
      <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <ContactForm defaultType={type ?? "shoot"} defaultService={service} />
        </div>
        <aside className="md:col-span-4 md:col-start-9">
          <a
            href={googleRating.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-10 flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
          >
            <Star className="size-4 fill-ink text-ink" strokeWidth={0} aria-hidden />
            <span>
              <span className="font-medium text-ink">{googleRating.rating.toFixed(1)}</span> on
              Google · {googleRating.count} review{googleRating.count === 1 ? "" : "s"}
            </span>
          </a>
          <p className="text-xs tracking-[0.16em] text-ink-muted uppercase">
            {copy.contact.studio}
          </p>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed text-ink-muted">
            <li>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink underline-offset-4 hover:underline"
              >
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postalCode}
              </a>
            </li>
            <li>{site.locationNote}</li>
            <li>{site.hours.weekdays}</li>
            <li>{site.hours.weekends}</li>
            <li>
              <EmailLink className="text-ink hover:opacity-70" />
            </li>
            <li>
              <PhoneLink className="text-ink hover:opacity-70" />
            </li>
            <li>
              <InstagramLink className="text-ink hover:opacity-70" />
            </li>
          </ul>
          <Link
            to="/rent"
            className="mt-8 inline-flex items-center gap-1 text-sm text-ink underline-offset-4 hover:underline"
          >
            {copy.contact.preferRent}
          </Link>
        </aside>
      </div>
    </main>
  );
}
