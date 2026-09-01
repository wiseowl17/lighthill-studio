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
    id: "maternity",
    name: "Maternity",
    price: "$650",
    duration: "90 minutes",
    description:
      "An unhurried session on the cyclorama. Partner and children are welcome.",
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
    id: "newborn",
    name: "Newborn",
    price: "$750",
    duration: "2 hours",
    description:
      "A slow session for the first days home. Wraps, posing, and a warm, controlled set.",
    featured: true,
    includes: [
      "Planning call and wrap options",
      "Up to 2 hours in studio",
      "Parents welcome in frame",
      "25 retouched images",
      "Print-ready files and web set",
    ],
  },
  {
    id: "branding",
    name: "Brand Studio",
    price: "$850",
    duration: "2 hours",
    description:
      "Portraits and lifestyle frames for a personal brand or small business — shot as one story.",
    includes: [
      "Shot list workshop",
      "2 hours on the floor",
      "Multiple looks / sets",
      "30 retouched images",
      "Social-ready crops",
    ],
  },
  {
    id: "headshots",
    name: "Corporate / Headshots",
    price: "$450",
    duration: "60 minutes",
    description:
      "Clean, directed portraits for LinkedIn, teams, and the press page — lit on the cyclorama.",
    includes: [
      "60 minutes in studio",
      "Up to 2 looks",
      "15 retouched images",
      "Social-ready crops",
      "Print release",
    ],
  },
  {
    id: "family",
    name: "Family Session",
    price: "$550",
    duration: "60 minutes",
    description:
      "Families, couples, and the in-between. Soft direction and room to breathe.",
    includes: [
      "60 minutes in studio",
      "Up to 6 people",
      "15 retouched images",
      "Online gallery",
      "Print release",
    ],
  },
  {
    id: "seasonals",
    name: "Seasonals",
    price: "$350",
    duration: "30 minutes",
    description:
      "Mini sessions on a dressed seasonal set. Limited dates, a tight gallery, and a reason to update the wall.",
    includes: [
      "30 minutes on the seasonal set",
      "Up to 5 people",
      "10 retouched images",
      "Online gallery",
      "Print release",
    ],
  },
  {
    id: "celebrations",
    name: "Celebrations",
    price: "$600",
    duration: "90 minutes",
    description:
      "Birthdays, cake smash, and themed celebrations that still belong in a studio, not a hallway.",
    includes: [
      "90 minutes on a dressed set",
      "Cake and props welcome",
      "20 retouched images",
      "Online gallery",
      "Print release",
    ],
  },
  {
    id: "podcasts",
    name: "Podcast Session",
    price: "$500",
    duration: "90 minutes",
    description:
      "Host portraits and talking-head frames in the finished podcast set — or a recording block with the lights already placed.",
    includes: [
      "90 minutes in the interview set",
      "Host and guest portraits",
      "15 retouched stills",
      "Set remains dressed",
      "Optional B-roll of the room",
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
    description: "Godox strobes with triggers. Ask if you need a specific modifier.",
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
