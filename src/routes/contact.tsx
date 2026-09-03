import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@data/site";
import {
  ContactForm,
  type InquiryType,
} from "@/components/contact/ContactForm";
import { PageHero } from "@/components/layout/PageHero";
import {
  EmailLink,
  InstagramLink,
  PhoneLink,
} from "@/components/layout/ContactLinks";

type ContactSearch = {
  type?: InquiryType;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    type:
      search.type === "rental" || search.type === "shoot"
        ? search.type
        : undefined,
  }),
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Lighthill Studio" },
      {
        name: "description",
        content:
          "Book an in-house photography session or inquire about renting Lighthill Studio in Lawrenceville, GA.",
      },
    ],
  }),
});

function ContactPage() {
  const { type } = Route.useSearch();

  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="Contact"
          title="Tell us what you are making."
          lede="In-house sessions start with a note. Studio rentals book instantly on Rent now — or ask us anything first."
        />
      </div>
      <div className="mx-auto grid max-w-7xl gap-14 px-5 pt-16 md:grid-cols-12 md:px-8">
        <div className="md:col-span-7">
          <ContactForm defaultType={type ?? "shoot"} />
        </div>
        <aside className="md:col-span-4 md:col-start-9">
          <p className="text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
            Studio
          </p>
          <ul className="mt-4 space-y-4 text-sm leading-relaxed text-ink-muted">
            <li>{site.location}</li>
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
            Prefer to rent? Rent now
          </Link>
        </aside>
      </div>
    </main>
  );
}
