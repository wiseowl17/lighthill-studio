export const colorfulCreators = [
  {
    id: "luz",
    src: "/images/colorful/photos-luz.jpg",
    alt: "Mini photo sessions with Luz Reyes",
    handle: "@luzreyherphotos",
    url: "https://www.instagram.com/luzreyherphotos/",
  },
  {
    id: "hillary",
    src: "/images/colorful/photos-hillary.jpg",
    alt: "Mini photo sessions with Hillary Urgelles",
    handle: "@safarishoot",
    url: "https://www.instagram.com/safarishoot/",
  },
  {
    id: "anva",
    src: "/images/colorful/tattoos-anva.jpg",
    alt: "Flash tattoos by Anva",
    handle: "@tattoosbyanva",
    url: "https://www.instagram.com/tattoosbyanva/",
  },
  {
    id: "byas",
    src: "/images/colorful/tattoos-byas.jpg",
    alt: "Flash tattoos by Byas",
    handle: "@byas.tattoo",
    url: "https://www.instagram.com/byas.tattoo/",
  },
  {
    id: "shai",
    src: "/images/colorful/drinks-shai.jpg",
    alt: "Handcrafted drinks by Maison Shai",
    handle: "@maison.shai",
    url: "https://www.instagram.com/maison.shai/",
  },
  {
    id: "junglou",
    src: "/images/colorful/acai-junglou.jpg",
    alt: "Açaí bowls by Junglou",
    handle: "@junglou.atl",
    url: "https://www.instagram.com/junglou.atl/",
  },
] as const;

export const colorfulTickets = [
  {
    id: "full",
    match: /full/i,
    priceLabel: "$150",
    tone: "sage",
  },
  {
    id: "tattoo",
    match: /tattoo|flash/i,
    priceLabel: "$180",
    tone: "rose",
  },
  {
    id: "photo",
    match: /photo/i,
    priceLabel: "$80",
    tone: "sky",
  },
] as const;

export type ColorfulTicketId = (typeof colorfulTickets)[number]["id"];
