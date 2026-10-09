/**
 * Social proof. Only real, published reviews belong here: copy them word for
 * word (mark trims with "…", and say when the text is Google's translation)
 * with the reviewer's name as the source shows it. Update the ratings and
 * counts when the listings change. Last checked 2026-10-09.
 */

export type Review = {
  quote: string;
  author: string;
  role?: string;
  source: "Google" | "Peerspace";
  /** "shoot" = an in-house session client, "rental" = rented the room. */
  kind: "shoot" | "rental";
  note?: string;
};

export type Rating = { source: "Google" | "Peerspace"; rating: number; count: number; url: string };

export const ratings: Rating[] = [
  {
    source: "Peerspace",
    rating: 5.0,
    count: 5,
    url: "https://www.peerspace.com/pages/listings/6a74b0ccd2019fc79dd2f88e",
  },
  {
    source: "Google",
    rating: 5.0,
    count: 2,
    url: "https://maps.app.goo.gl/bXjkh5zeN1Xq2rrt5",
  },
];

/** Kept for the contact page badge. */
export const googleRating = ratings.find((r) => r.source === "Google")!;

export const reviews: Review[] = [
  {
    quote:
      "Everything you would need for photos or video is here for you. The space is clean and spacious so you do not feel cramped with extra decor.",
    author: "Kito R.",
    source: "Peerspace",
    kind: "rental",
  },
  {
    quote:
      "Very nice space and easy to book. The parking lot is right outside the studio, which is a plus when unloading equipment.",
    author: "Chris M.",
    role: "Photographer",
    source: "Peerspace",
    kind: "rental",
  },
  {
    quote:
      "The space is large, spacious, and very well maintained, with excellent lighting that makes it perfect for photo sessions.",
    author: "Marisol H.",
    source: "Peerspace",
    kind: "rental",
  },
  {
    quote:
      "It was last minute, but she answered all my questions within minutes. Will definitely book again.",
    author: "Rica L.",
    source: "Peerspace",
    kind: "rental",
  },
  {
    quote: "Beautiful space and lovely host! Will book again",
    author: "Jhenelle W.",
    role: "Photographer",
    source: "Peerspace",
    kind: "rental",
  },
  {
    quote: "I loved her work, I was delighted with my photos.",
    author: "Jorlene G.",
    source: "Google",
    kind: "shoot",
    note: "Translated from Spanish by Google",
  },
];
