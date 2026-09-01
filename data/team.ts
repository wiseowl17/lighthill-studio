/**
 * Team CMS. Swap names, titles, bios, and portrait paths as the roster changes.
 */

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  objectPosition?: string;
  instagram?: string;
};

export const team: TeamMember[] = [
  {
    id: "luz",
    name: "Luz Reyes",
    title: "Photographer",
    bio: "Luz leads in-house sessions at Lighthill — maternity, newborns, families, and the personal brands that need a room already built for a face. She directs with a light touch and treats the cyclorama like a set, not a box.",
    image: "/images/team-luz.jpg",
    objectPosition: "center 12%",
    instagram: "https://www.instagram.com/lighthill_studio/",
  },
  {
    id: "hillary",
    name: "Hillary Urgelles",
    title: "Photographer",
    bio: "Hillary photographs the work that fills the calendar: seasonal sets, small events, branding, and podcast days. She keeps the floor moving and the light consistent, whether it’s a toddler on the cove or a founder at the desk.",
    image: "/images/team-hillary.jpg",
    objectPosition: "64% 18%",
  },
];

export const teamIntro = {
  eyebrow: "The people",
  title: "A small studio. A considered eye.",
  body: "Lighthill is run by photographers who also built the room. Book the in-house team for a directed session, or rent the floor and bring your own.",
} as const;
