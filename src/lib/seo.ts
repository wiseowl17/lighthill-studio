import { site } from "@data/site";
import type { FaqItem } from "@data/faq";
import { team } from "@data/team";

/**
 * Search and AI-answer metadata shared by the public routes.
 *
 * Share-card tags (og:*, twitter:*) are NOT set here: the platform head
 * injector in scripts/grok-pwa-shared.mjs strips and rewrites them on every
 * HTML response. It builds og:title from <title> and og:description from the
 * page's meta description, so setting those two per route is enough.
 */
export const SITE_ORIGIN = "https://www.lighthillstudio.com";

/** Google Business Profile. Ties the site to the Maps listing and its reviews. */
const GOOGLE_MAPS_URL = site.mapsUrl;

type PageHeadInput = {
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
};

export function canonical(path: string) {
  return { rel: "canonical", href: `${SITE_ORIGIN}${path}` };
}

export function pageHead({ path, title, description, noindex }: PageHeadInput) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: [canonical(path)],
  };
}

function jsonLd(data: unknown) {
  return {
    type: "application/ld+json",
    // Escape "<" so copy can never close the script tag early.
    children: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

/** The studio as a local business. Name, address and phone must match the Google listing. */
export function businessJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_ORIGIN}/#business`,
    name: site.name,
    description:
      "Infinity wall photography studio in Lawrenceville, Georgia, just outside Atlanta. In-house maternity, newborn, family, branding, headshot and podcast sessions, plus hourly studio rental for photographers and videographers.",
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/icon-512.png`,
    image: `${SITE_ORIGIN}/og.jpg`,
    telephone: site.phone,
    email: site.email,
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: 33.952743, longitude: -84.053759 },
    areaServed: [
      { "@type": "City", name: "Lawrenceville, GA" },
      { "@type": "AdministrativeArea", name: "Gwinnett County, GA" },
      { "@type": "City", name: "Atlanta, GA" },
    ],
    hasMap: GOOGLE_MAPS_URL,
    sameAs: [site.instagram, site.peerspaceUrl, GOOGLE_MAPS_URL],
    knowsAbout: [
      "Infinity wall studio",
      "Cyclorama",
      "Maternity photography",
      "Newborn photography",
      "Family photography",
      "Branding photography",
      "Headshots",
      "Podcast recording",
    ],
    makesOffer: {
      "@type": "Offer",
      name: "Infinity wall studio rental",
      url: `${SITE_ORIGIN}/rent`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: 55,
        priceCurrency: "USD",
        unitText: "hour",
      },
    },
  });
}

/** Owners as Person entities tied to the business, for name searches. */
export function teamJsonLd() {
  const knows: Record<string, string[]> = {
    luz: [
      "Maternity photography",
      "Newborn photography",
      "Family photography",
      "Cake smash photography",
    ],
    hillary: [
      "Seasonal mini sessions",
      "Celebration photography",
      "Branding photography",
      "Podcast production",
    ],
  };
  return jsonLd({
    "@context": "https://schema.org",
    "@graph": team.map((member) => ({
      "@type": "Person",
      "@id": `${SITE_ORIGIN}/team#${member.id}`,
      name: member.name,
      jobTitle: "Co-owner and photographer",
      image: `${SITE_ORIGIN}${member.image}`,
      url: `${SITE_ORIGIN}/team`,
      sameAs: [member.instagram],
      knowsAbout: knows[member.id] ?? [],
      worksFor: { "@id": `${SITE_ORIGIN}/#business` },
    })),
  });
}

export function faqJsonLd(items: FaqItem[]) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  });
}
