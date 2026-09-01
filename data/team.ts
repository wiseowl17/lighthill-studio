/**
 * Team CMS. Swap names, titles, bios, and headshot paths as the roster changes.
 */

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  instagram?: string;
};

export const team: TeamMember[] = [
  {
    id: "manuel",
    name: "Manuel Cruz",
    title: "Founder & Director",
    bio: "Manuel built Lighthill around the light he wanted on this side of Atlanta — a quiet cyclorama, a long run of windows, and enough floor for a real set. He directs in-house sessions and keeps the room ready for the photographers who rent it.",
    image: "/images/team-manuel.jpg",
    instagram: "https://www.instagram.com/lighthill_studio/",
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    title: "Lead Photographer",
    bio: "Sofia leads in-house portrait work — maternity, brands, and the headshots people actually send. She directs with a light touch and lights like the window is still the key, even when it isn’t.",
    image: "/images/team-sofia.jpg",
  },
];

export const teamIntro = {
  eyebrow: "The people",
  title: "A small studio. A considered eye.",
  body: "Lighthill is run by photographers who also built the room. Book the in-house team for a directed session, or rent the floor and bring your own.",
} as const;
