export type StudioFeature = {
  id: string;
  title: string;
  description: string;
  image: string;
  objectPosition?: string;
};

export type Amenity = {
  id: string;
  title: string;
  detail: string;
};

export const studioIntro = {
  eyebrow: "The space",
  title: "A quiet floor with a true infinity wall.",
  body: "Lighthill is a 1,200 square-foot studio in Lawrenceville — built for photographers, videographers, and small productions who want a cyclorama, controlled strobe lighting, and enough room to work without a warehouse echo.",
} as const;

export const studioFeatures: StudioFeature[] = [
  {
    id: "cyclorama",
    title: "White infinity wall",
    description:
      "A full cyclorama that disappears the horizon. Portraits, maternity, branding, and talking-head video all sit cleanly on the cove — no wrinkled muslin, no visible floor line.",
    image: "/images/cyclorama.jpg",
    objectPosition: "center 78%",
  },
  {
    id: "lighting",
    title: "Studio lighting",
    description:
      "Godox strobes, octas, and modifiers ready as add-ons. The base rental is the room and the cyclorama — bring your own kit, or use ours. No guessing at the weather.",
    image: "/images/lighting.jpg",
    objectPosition: "center 42%",
  },
  {
    id: "podcast",
    title: "Podcast set",
    description:
      "A finished interview corner: channel-tufted chairs, a wood-slat wall, and a round table already dressed. Sit down and record — or photograph the hosts in place.",
    image: "/images/podcast.jpg",
    objectPosition: "center 52%",
  },
  {
    id: "sets",
    title: "Built-in sets",
    description:
      "A navy paneled desk for branding, a lounge chair against warm slats, and a peacock chair with pampas for portraits. Change the story without building a set from scratch.",
    image: "/images/professional-space.jpg",
    objectPosition: "center 55%",
  },
  {
    id: "dressing",
    title: "Changing room & restroom",
    description:
      "A private, accessible restroom on the floor with a sink, mirror, and room to change. Clients can settle in without living out of a duffel on the studio floor.",
    image: "/images/bathroom.jpg",
    objectPosition: "center 62%",
  },
];

export const amenities: Amenity[] = [
  { id: "wifi", title: "High-speed Wi-Fi", detail: "Tethering and uploads without hunting for a hotspot." },
  { id: "parking", title: "Free parking", detail: "On-site spaces. No garage run, no meters." },
  { id: "climate", title: "Air conditioning", detail: "The floor stays comfortable through Georgia summers." },
  { id: "access", title: "Street-level access", detail: "No freight elevator. Roll a cart straight in." },
  { id: "restrooms", title: "Restrooms", detail: "On the floor, not down a hallway in another suite." },
  { id: "paper", title: "Color paper rolls", detail: "A rack of seamless colors when white isn’t the story." },
  { id: "power", title: "Clean power", detail: "Outlets placed for stands, packs, and a tether station." },
  { id: "capacity", title: "20 people", detail: "Crew, talent, and clients — up to twenty on the floor." },
];

export const studioSpecs = [
  { label: "Floor", value: "1,200 sq ft" },
  { label: "Capacity", value: "20 guests" },
  { label: "Cyclorama", value: "White infinity wall" },
  { label: "Light", value: "Godox studio strobes" },
  { label: "Access", value: "Street level" },
  { label: "Parking", value: "Free on site" },
] as const;
