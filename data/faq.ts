export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  group: "Sessions" | "Rentals" | "House rules";
};

export const faq: FaqItem[] = [
  {
    id: "what-to-expect",
    group: "Sessions",
    question: "What should I expect at an in-house shoot?",
    answer:
      "You’ll be met by the photographer, walked through the floor, and given time in the dressing area. Sessions are directed but unhurried — we light, we shoot, we recast if a look isn’t working. Galleries typically land within seven days.",
  },
  {
    id: "wardrobe",
    group: "Sessions",
    question: "What should I wear?",
    answer:
      "Bring two or three looks in a tight palette — cream, black, navy, earth. Avoid giant logos and neon. We keep a few studio pieces on the rack if something isn’t sitting right. A planning note goes out after you book.",
  },
  {
    id: "plus-ones",
    group: "Sessions",
    question: "Can I bring my partner, kids, or a stylist?",
    answer:
      "Yes. Capacity is twenty people including crew. Tell us who is coming when you book so we can plan the floor. Children are welcome; we just keep snacks and markers off the cyclorama.",
  },
  {
    id: "session-cancel",
    group: "Sessions",
    question: "What is the cancellation policy for in-house sessions?",
    answer:
      "A 50% retainer holds the date. Cancel or reschedule seven or more days out and the retainer transfers to a new date within six months. Inside seven days the retainer is forfeited. Inside 24 hours the full session fee is due.",
  },
  {
    id: "usage",
    group: "Sessions",
    question: "How can I use the photographs?",
    answer:
      "Personal sessions include personal usage and social sharing. Brand and commercial packages include web and print usage for the commissioning business. Extended licensing, paid ads, and third-party usage can be added in writing.",
  },
  {
    id: "how-to-rent",
    group: "Rentals",
    question: "How do I rent the studio?",
    answer:
      "Book on this site with Rent now — live availability, 50% deposit, instant confirmation. Lighting, paper, and an assistant are add-ons at checkout. Peerspace stays open as a second door.",
  },
  {
    id: "rental-minimum",
    group: "Rentals",
    question: "Is there a minimum rental?",
    answer:
      "Yes. Two hours, at $55 per hour. Bookings of eight hours or more receive 20% off. The studio is available 24 hours — the shopping plaza doesn’t close.",
  },
  {
    id: "rental-gear",
    group: "Rentals",
    question: "Does the rental include lights?",
    answer:
      "No. The base rate is the room, the cyclorama, Wi-Fi, parking, and the dressing area. Bring your own kit, or add flashes, modifiers, and paper through the host. We are happy to walk first-time renters through the wall.",
  },
  {
    id: "rental-cancel",
    group: "Rentals",
    question: "What is the rental cancellation policy?",
    answer:
      "A 50% deposit confirms the time. Full refund of the deposit if you cancel at least 48 hours before start. Inside 48 hours the deposit is held. Write us if you need to move the date. Peerspace bookings still follow Peerspace’s policy.",
  },
  {
    id: "leave-it",
    group: "House rules",
    question: "How should I leave the studio?",
    answer:
      "As you found it. Trash out, furniture and props back, spills wiped, cyclorama scuffs reported. Excessive cleaning or damage beyond normal use may be billed. Tape and clamps are fine; no drilling, no paint, no glitter.",
  },
  {
    id: "food",
    group: "House rules",
    question: "Is food and drink allowed?",
    answer:
      "Yes, off the cyclorama. Water on set is fine with a cap. Coffee, oil, red sauces, and anything that stains stay in the dressing area. Alcohol is allowed for talent only, not for a party — this is a working floor.",
  },
  {
    id: "parking",
    group: "House rules",
    question: "Where do I park, and how do I get in?",
    answer:
      "Free on-site parking and street-level access. The exact address and entry notes go out with your confirmation.",
  },
];

export const faqGroups: FaqItem["group"][] = ["Sessions", "Rentals", "House rules"];
