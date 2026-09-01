/**
 * Pricing CMS. Edit numbers here — the Pricing page maps over these objects.
 * Last reviewed against the Peerspace listing (studio rental) and in-house packages.
 */

export type PhotographyPackage = {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
  featured?: boolean;
  includes: string[];
};

export type RentalRate = {
  id: string;
  name: string;
  price: string;
  note: string;
};

export type Addon = {
  id: string;
  name: string;
  price: string;
  description: string;
};

export const photographyPackages: PhotographyPackage[] = [
  {
    id: "headshots",
    name: "Studio Headshots",
    price: "$350",
    duration: "45 minutes",
    description:
      "A focused portrait session for one person. Wardrobe changes welcome. Delivered as a tight, usable set.",
    includes: [
      "Pre-session consult",
      "45 minutes on set",
      "8 retouched images",
      "Online gallery within 7 days",
      "Personal and commercial usage",
    ],
  },
  {
    id: "maternity",
    name: "Maternity",
    price: "$650",
    duration: "90 minutes",
    description:
      "An unhurried session on the cyclorama and in window light. Partner and children are welcome.",
    featured: true,
    includes: [
      "Planning call and mood notes",
      "90 minutes with the in-house team",
      "Use of studio wardrobe pieces",
      "20 retouched images",
      "Print-ready files and web set",
    ],
  },
  {
    id: "branding",
    name: "Brand Studio",
    price: "$850",
    duration: "2 hours",
    description:
      "Portraits, product, and lifestyle frames for a personal brand or small business — shot as one story.",
    featured: true,
    includes: [
      "Shot list workshop",
      "2 hours on the floor",
      "Multiple looks / sets",
      "30 retouched images",
      "Social-ready crops",
    ],
  },
  {
    id: "family",
    name: "Family Session",
    price: "$550",
    duration: "60 minutes",
    description:
      "Families, couples, and the in-between. Soft direction, natural light, and room to breathe.",
    includes: [
      "60 minutes in studio",
      "Up to 6 people",
      "15 retouched images",
      "Online gallery",
      "Print release",
    ],
  },
  {
    id: "product",
    name: "Product Still Life",
    price: "$450",
    duration: "90 minutes",
    description:
      "Objects on seamless or the infinity wall. Lighting designed around the thing, not a template.",
    includes: [
      "Up to 8 products / SKUs",
      "Hero + detail frames",
      "12 retouched images",
      "White-background options",
      "Web and print files",
    ],
  },
  {
    id: "half-day",
    name: "Half-Day Directed",
    price: "$1,400",
    duration: "4 hours",
    description:
      "A longer directed day with the in-house team — campaigns, lookbooks, and mixed portrait / product work.",
    includes: [
      "4 hours of directed shooting",
      "Lighting and set changes",
      "50 retouched images",
      "Usage for web and print",
      "Optional assistant (see add-ons)",
    ],
  },
];

export const rentalRates: RentalRate[] = [
  {
    id: "hourly",
    name: "Hourly rental",
    price: "$55 / hour",
    note: "Cyclorama studio. Lighting is an add-on.",
  },
  {
    id: "minimum",
    name: "Minimum booking",
    price: "2 hours",
    note: "Required on all rental reservations.",
  },
  {
    id: "day-rate",
    name: "8+ hour day",
    price: "20% off",
    note: "Automatically applied to bookings of 8 hours or more.",
  },
  {
    id: "capacity",
    name: "Capacity",
    price: "10 guests",
    note: "1,200 sq ft. Street-level access and free parking.",
  },
];

export const addons: Addon[] = [
  {
    id: "paper",
    name: "Paper roll backdrop",
    price: "$25 / color",
    description:
      "Sage, terracotta, charcoal, cream, dusty rose, and seasonal colors on the wall rack.",
  },
  {
    id: "flashes",
    name: "Studio flashes",
    price: "$40 / session",
    description: "Battery and pack strobes with triggers. Ask if you need a specific modifier.",
  },
  {
    id: "softboxes",
    name: "Softboxes & modifiers",
    price: "$30 / session",
    description: "Octas, beauty dish, flags, and a boom. Pairs with the flash kit.",
  },
  {
    id: "assistant",
    name: "Studio assistant",
    price: "$45 / hour",
    description:
      "A second pair of hands for tethering, boom work, and keeping the cyclorama clean.",
  },
];

export const pricingNotes = [
  "In-house sessions are quoted for one photographer and include the studio. Travel days are separate.",
  "Studio rental is booked on Peerspace. The listed rate is for the cyclorama space; lighting and paper are add-ons.",
  "A 50% retainer confirms in-house dates. The balance is due the day of the session.",
  "Additional retouching and rush delivery can be added after the gallery lands.",
] as const;
