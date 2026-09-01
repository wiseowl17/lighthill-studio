export type Service = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
};

export const services: Service[] = [
  {
    id: "maternity",
    title: "Maternity",
    kicker: "Portraits",
    description:
      "Quiet, filmic sessions on the cyclorama or in window light. Made to feel like stills, not setups.",
    image: "/images/maternity.jpg",
  },
  {
    id: "headshots",
    title: "Headshots",
    kicker: "Portraits",
    description:
      "Studio portraits for people who need to look like themselves — actors, founders, teams, and everyone in between.",
    image: "/images/headshot-woman.jpg",
  },
  {
    id: "branding",
    title: "Branding",
    kicker: "Commercial",
    description:
      "Personal brand and small-business imagery with room to move. Product, portrait, and lifestyle in one space.",
    image: "/images/branding.jpg",
  },
  {
    id: "family",
    title: "Family",
    kicker: "Portraits",
    description:
      "Unhurried family and couple sessions. Neutral wardrobe, natural light, and a floor the kids can actually use.",
    image: "/images/family.jpg",
  },
  {
    id: "product",
    title: "Product",
    kicker: "Commercial",
    description:
      "Clean still life on seamless paper or the infinity wall. Jewelry, objects, and the things you make.",
    image: "/images/product.jpg",
  },
  {
    id: "editorial",
    title: "Editorial",
    kicker: "Fashion",
    description:
      "Fashion and beauty work that uses the cyclorama as a graphic field — hard light, soft light, or both.",
    image: "/images/fashion.jpg",
  },
];

export const marqueeItems = [
  "Maternity",
  "Headshots",
  "Branding",
  "Family",
  "Product",
  "Editorial",
  "Content",
  "Cyclorama",
] as const;
