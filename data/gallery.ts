export type GalleryCategory =
  | "All"
  | "Studio"
  | "Maternity"
  | "Newborn"
  | "Branding"
  | "Headshots"
  | "Family"
  | "Seasonals"
  | "Celebrations"
  | "Podcasts";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "All">;
  span?: "tall" | "wide" | "square";
};

export const galleryCategories: GalleryCategory[] = [
  "All",
  "Studio",
  "Maternity",
  "Newborn",
  "Branding",
  "Headshots",
  "Family",
  "Seasonals",
  "Celebrations",
  "Podcasts",
];

export const galleryImages: GalleryImage[] = [
  {
    id: "cyclorama",
    src: "/images/cyclorama.jpg",
    alt: "White cyclorama cove with paper rolls and Godox lighting",
    category: "Studio",
    span: "wide",
  },
  {
    id: "maternity",
    src: "/images/maternity.jpg",
    alt: "Maternity portrait on the white infinity wall",
    category: "Maternity",
    span: "tall",
  },
  {
    id: "newborn",
    src: "/images/newborn.jpg",
    alt: "Newborn wrapped in blush linen on a lilac set",
    category: "Newborn",
    span: "square",
  },
  {
    id: "headshots",
    src: "/images/headshots.jpg",
    alt: "Corporate headshot in a white suit on the cyclorama",
    category: "Headshots",
    span: "tall",
  },
  {
    id: "infinity-wall",
    src: "/images/infinity-wall.jpg",
    alt: "Infinity wall with posing stairs, sheer drapes, and a Godox octabox",
    category: "Studio",
    span: "tall",
  },
  {
    id: "branding",
    src: "/images/branding.jpg",
    alt: "Personal brand session with spotlight and lookbook prints",
    category: "Branding",
    span: "tall",
  },
  {
    id: "family",
    src: "/images/family.jpg",
    alt: "Multi-generation family portrait in cream tones",
    category: "Family",
    span: "tall",
  },
  {
    id: "seasonal",
    src: "/images/seasonal.jpg",
    alt: "Seasonal Easter session with siblings and studio props",
    category: "Seasonals",
    span: "tall",
  },
  {
    id: "birthdays",
    src: "/images/birthdays.jpg",
    alt: "Celebration birthday session on a mermaid set",
    category: "Celebrations",
    span: "tall",
  },
  {
    id: "podcast",
    src: "/images/podcast.jpg",
    alt: "Podcast interview set with velvet chairs and a wood-slat wall",
    category: "Podcasts",
    span: "tall",
  },
  {
    id: "lighting",
    src: "/images/lighting.jpg",
    alt: "Godox strobe on a stand in the cyclorama",
    category: "Studio",
    span: "tall",
  },
  {
    id: "professional-space",
    src: "/images/professional-space.jpg",
    alt: "Navy paneled branding set with a walnut desk",
    category: "Studio",
    span: "tall",
  },
  {
    id: "lounge",
    src: "/images/lounge.jpg",
    alt: "Lounge chair against a warm wood-slat wall",
    category: "Studio",
    span: "tall",
  },
  {
    id: "props",
    src: "/images/props.jpg",
    alt: "Peacock chair, pampas, and draped linen for portrait sets",
    category: "Studio",
    span: "tall",
  },
  {
    id: "bathroom",
    src: "/images/bathroom.jpg",
    alt: "Private changing room and restroom on the studio floor",
    category: "Studio",
    span: "tall",
  },
];
