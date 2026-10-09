import { site } from "@data/site";
import type { FaqItem } from "@data/faq";

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
      "Cyclorama photography studio in Lawrenceville, Georgia, just outside Atlanta. In-house maternity, newborn, family, branding, headshot and podcast sessions, plus hourly studio rental for photographers and videographers.",
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/icon-512.png`,
    image: `${SITE_ORIGIN}/og.jpg`,
    telephone: site.phone,
    email: site.email,
    priceRange: "$$",
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
      "Cyclorama studio",
      "Maternity photography",
      "Newborn photography",
      "Family photography",
      "Branding photography",
      "Headshots",
      "Podcast recording",
    ],
    makesOffer: {
      "@type": "Offer",
      name: "Cyclorama studio rental",
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
