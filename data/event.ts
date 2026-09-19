export const colorfulCreators = [
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

export const refundDisclaimer = {
  title: "Refund Policy",
  titleEs: "Política de Reembolso",
  content:
    "All ticket sales are final. No refunds or exchanges are permitted. If an event is cancelled by Lighthill Studio, ticket holders will receive a full refund or credit toward a future event.",
  contentEs:
    "Todas las ventas de entradas son finales. No se permiten reembolsos ni cambios. Si Lighthill Studio cancela un evento, los titulares de entradas recibirán un reembolso completo o un crédito para un evento futuro.",
};
