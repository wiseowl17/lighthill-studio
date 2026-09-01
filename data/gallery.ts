export type GalleryCategory =
  | "All"
  | "Studio"
  | "Maternity"
  | "Portraits"
  | "Branding"
  | "Family"
  | "Fashion"
  | "Product";

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
  "Portraits",
  "Branding",
  "Family",
  "Fashion",
  "Product",
];

export const galleryImages: GalleryImage[] = [
  {
    id: "hero-studio",
    src: "/images/hero-studio.jpg",
    alt: "Sunlit cyclorama studio with industrial windows",
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
    id: "headshot-woman",
    src: "/images/headshot-woman.jpg",
    alt: "Studio headshot of a woman in a charcoal blazer",
    category: "Portraits",
    span: "tall",
  },
  {
    id: "cyclorama",
    src: "/images/cyclorama.jpg",
    alt: "White cyclorama cove with a single strobe",
    category: "Studio",
    span: "wide",
  },
  {
    id: "fashion",
    src: "/images/fashion.jpg",
    alt: "Fashion editorial against the infinity wall",
    category: "Fashion",
    span: "tall",
  },
  {
    id: "branding",
    src: "/images/branding.jpg",
    alt: "Personal brand session with ceramics in window light",
    category: "Branding",
    span: "wide",
  },
  {
    id: "family",
    src: "/images/family.jpg",
    alt: "Family portrait in cream tones by the studio windows",
    category: "Family",
    span: "wide",
  },
  {
    id: "headshot-man",
    src: "/images/headshot-man.jpg",
    alt: "Studio headshot of a man in a navy knit",
    category: "Portraits",
    span: "tall",
  },
  {
    id: "natural-light",
    src: "/images/natural-light.jpg",
    alt: "Afternoon light across the studio floor",
    category: "Studio",
    span: "wide",
  },
  {
    id: "couple",
    src: "/images/couple.jpg",
    alt: "Couple portrait on the cyclorama",
    category: "Family",
    span: "wide",
  },
  {
    id: "product",
    src: "/images/product.jpg",
    alt: "Jewelry still life on white seamless",
    category: "Product",
    span: "square",
  },
  {
    id: "dressing",
    src: "/images/dressing.jpg",
    alt: "Studio dressing area with vanity and wardrobe rack",
    category: "Studio",
    span: "wide",
  },
  {
    id: "beauty",
    src: "/images/beauty.jpg",
    alt: "Beauty close-up with dewy skin and a large softbox",
    category: "Fashion",
    span: "tall",
  },
  {
    id: "lighting",
    src: "/images/lighting.jpg",
    alt: "Softboxes and modifiers set on the studio floor",
    category: "Studio",
    span: "wide",
  },
  {
    id: "content",
    src: "/images/content.jpg",
    alt: "Content creator filming a product in the studio",
    category: "Branding",
    span: "wide",
  },
  {
    id: "paper-rolls",
    src: "/images/paper-rolls.jpg",
    alt: "Rack of colored seamless paper rolls",
    category: "Studio",
    span: "wide",
  },
];
