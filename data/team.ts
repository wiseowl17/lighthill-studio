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
  instagram: string;
  instagramHandle: string;
};

export const team: TeamMember[] = [
  {
    id: "luz",
    name: "Luz Reyes",
    title: "Co-owner",
    bio: "Luz Reyes is a co-owner of Lighthill Studio and the photographer behind Luzreyher Photography in Lawrenceville, Georgia, just outside Atlanta. She specializes in maternity, newborn, family, and cake smash photography, the seasons of life she loves most: the anticipation of becoming a mother, the tiny details of a newborn, the connection inside a family, and the joy of a first birthday smash.\n\nFor Luz, photography is more than beautiful pictures. It is an experience, and a feeling preserved that you can return to years from now. Her goal is for everyone in front of her camera to feel comfortable, beautiful, and truly seen.",
    image: "/images/team-luz.jpg",
    objectPosition: "center 12%",
    instagram: "https://www.instagram.com/luzreyherphotos/",
    instagramHandle: "@luzreyherphotos",
  },
  {
    id: "hillary",
    name: "Hillary Urgelles",
    title: "Co-owner",
    bio: "Hillary is a co-owner of Lighthill. She and Luz work the floor together on seasonal sets, celebrations, branding, and podcast days — keeping the room moving and the light consistent, from a toddler on the cove to a founder at the desk.",
    image: "/images/team-hillary.jpg",
    objectPosition: "64% 18%",
    instagram: "https://www.instagram.com/safarishoot/",
    instagramHandle: "@safarishoot",
  },
];

export const teamIntro = {
  eyebrow: "The people",
  title: "Co-owners, side by side.",
  body: "Luz Reyes and Hillary Urgelles built Lighthill together, and they still shoot it that way — two photographers, one floor, working every session as a pair. Book the in-house team, or rent the space and bring your own.",
} as const;
