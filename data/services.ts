export type Service = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  objectPosition?: string;
};

export const services: Service[] = [
  {
    id: "maternity",
    title: "Maternity",
    kicker: "Portraits",
    description:
      "Quiet, filmic sessions on the cyclorama. Made to feel like stills, not setups.",
    image: "/images/maternity.jpg",
  },
  {
    id: "newborn",
    title: "Newborn",
    kicker: "Portraits",
    description:
      "Slow, warm sessions for the first days. Wrapped, posed, and lit with studio strobes — never rushed.",
    image: "/images/newborn.jpg",
  },
  {
    id: "branding",
    title: "Branding",
    kicker: "Commercial",
    description:
      "Personal brand and small-business imagery with room to move. Portrait and lifestyle in one space.",
    image: "/images/branding.jpg",
  },
  {
    id: "headshots",
    title: "Headshots",
    kicker: "Corporate",
    description:
      "Clean, directed portraits for teams, LinkedIn, and the press page — lit on the infinity wall.",
    image: "/images/headshots.jpg",
  },
  {
    id: "family",
    title: "Family",
    kicker: "Portraits",
    description:
      "Unhurried family sessions. Neutral wardrobe, directed posing, and a floor the kids can actually use.",
    image: "/images/family.jpg",
  },
  {
    id: "seasonals",
    title: "Seasonals",
    kicker: "Mini sessions",
    description:
      "Holiday and seasonal sets that change with the calendar — Easter, fall, Christmas, and the in-between.",
    image: "/images/seasonal.jpg",
  },
  {
    id: "celebrations",
    title: "Celebrations",
    kicker: "Events",
    description:
      "Birthdays, cake smash, and the little productions that still deserve a real set.",
    image: "/images/birthdays.jpg",
  },
  {
    id: "podcasts",
    title: "Podcasts",
    kicker: "Production",
    description:
      "A dedicated interview set — slat wall, lounge chairs, and light already built for talking-head video.",
    image: "/images/podcast.jpg",
    objectPosition: "center 48%",
  },
];

export const marqueeItems = [
  "Maternity",
  "Newborn",
  "Branding",
  "Headshots",
  "Family",
  "Seasonals",
  "Celebrations",
  "Podcasts",
  "Cyclorama",
] as const;
