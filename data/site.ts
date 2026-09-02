/**
 * Site-wide constants. Change these and redeploy.
 * Form submissions go to `contactEmail` via FormSubmit.
 * Confirm the email the first time a form is sent (FormSubmit sends a one-time link).
 */

export const site = {
  name: "Lighthill Studio",
  shortName: "Lighthill",
  tagline: "A studio made of light.",
  description:
    "In-house photography and a rentable cyclorama studio in Lawrenceville, Georgia — just outside Atlanta.",
  location: "Lawrenceville, Georgia",
  locationNote: "Just outside Atlanta. Exact address is shared after booking.",
  email: "studiolighthill@gmail.com",
  contactEmail: "studiolighthill@gmail.com",
  phone: "+14702069150",
  phoneDisplay: "+1 (470) 206-9150",
  instagram: "https://www.instagram.com/lighthill_studio/",
  instagramHandle: "@lighthill_studio",
  peerspaceUrl:
    "https://www.peerspace.com/pages/listings/6a74b0ccd2019fc79dd2f88e",
  sqft: 1200,
  capacity: 20,
  hours: {
    weekdays: "Open 24 hours",
    weekends: "The shopping plaza doesn’t close — book any time.",
  },
} as const;

export const nav = [
  { label: "Studio", to: "/studio" },
  { label: "Gallery", to: "/gallery" },
  { label: "Pricing", to: "/pricing" },
  { label: "Team", to: "/team" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
] as const;

export type NavItem = (typeof nav)[number];
