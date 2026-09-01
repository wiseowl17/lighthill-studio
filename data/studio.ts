export type StudioFeature = {
  id: string;
  title: string;
  description: string;
  image: string;
};

export type Amenity = {
  id: string;
  title: string;
  detail: string;
};

export const studioIntro = {
  eyebrow: "The space",
  title: "A bright, quiet floor with an infinity wall.",
  body: "Lighthill is a 1,200 square-foot studio in Lawrenceville — built for photographers, videographers, and small productions who want natural light, a true cyclorama, and enough room to work without a warehouse echo.",
} as const;

export const studioFeatures: StudioFeature[] = [
  {
    id: "cyclorama",
    title: "White infinity wall",
    description:
      "A full cyclorama that disappears the horizon. Portraits, product, fashion, and talking-head video all sit cleanly on the cove — no wrinkled muslin, no visible floor line.",
    image: "/images/cyclorama.jpg",
  },
  {
    id: "light",
    title: "Northern window light",
    description:
      "A long run of industrial windows keeps the floor usable from first booking to last. Soft, even daylight with just enough direction to shape a face without a single strobe.",
    image: "/images/natural-light.jpg",
  },
  {
    id: "dressing",
    title: "Dressing area",
    description:
      "A private corner to change, a lit vanity, a full-length mirror, and a rack. Clients can settle in without living out of a duffel on the studio floor.",
    image: "/images/dressing.jpg",
  },
  {
    id: "lighting",
    title: "Lighting, when you want it",
    description:
      "Strobes, octas, a beauty dish, flags, and a boom are available as add-ons. The base rental is the room and the cyclorama — bring your own kit, or use ours.",
    image: "/images/lighting.jpg",
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
  { id: "capacity", title: "10 people", detail: "Crew, talent, and a client — without stacking cases." },
];

export const studioSpecs = [
  { label: "Floor", value: "1,200 sq ft" },
  { label: "Capacity", value: "10 guests" },
  { label: "Cyclorama", value: "White infinity wall" },
  { label: "Light", value: "North-facing windows" },
  { label: "Access", value: "Street level" },
  { label: "Parking", value: "Free on site" },
] as const;
