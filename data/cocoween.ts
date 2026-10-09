/**
 * Cocoween (Oct 31 2026), the /event page. Facts come from the owners' flyers
 * (public/images/events/cocoween-flyer-*.jpg) and owner decisions: walk-in any
 * time 1–4 PM, no ticket cap, $60 per child. Stripe finds the ticket by
 * product metadata event=cocoween; the price below is display only.
 */

export type Lang = "en" | "es";
type Both = { en: string; es: string };

export const cocoween = {
  key: "cocoween" as const,
  name: "Cocoween",
  date: "2026-10-31",
  startsAt: "2026-10-31T13:00:00-04:00",
  endsAt: "2026-10-31T16:00:00-04:00",
  /** Hide nav link, homepage strip and checkout after this local date. */
  lastDay: "2026-10-31",
  priceCents: 6000,
  partner: { name: "Fluffy Bee Ceramics" },
  flyers: {
    en: "/images/events/cocoween-flyer-en.jpg",
    es: "/images/events/cocoween-flyer-es.jpg",
  },
} as const;

/** The tabla: what every child's ticket includes, one lotería card each. */
export const cocoweenCards: Array<{
  id: string;
  number: number;
  title: string; // card names stay in Spanish, as on every lotería deck
  image: string;
  field: "marigold" | "rosa" | "turquesa";
  /** "contain" shows the whole picture on the card field (wide art). */
  fit?: "contain";
  caption: Both;
  detail: Both;
}> = [
  {
    id: "ceramica",
    number: 1,
    title: "Cerámica",
    image: "/images/events/cocoween-card-ceramica.jpg",
    field: "marigold",
    caption: { en: "Paint your own ceramic", es: "Pinta tu cerámica" },
    detail: {
      en: "Each child paints a Halloween or Día de los Muertos ceramic piece with Fluffy Bee Ceramics.",
      es: "Cada niño pinta una pieza de cerámica de Halloween o Día de los Muertos con Fluffy Bee Ceramics.",
    },
  },
  {
    id: "foto",
    number: 2,
    title: "Sesión de Fotos",
    image: "/images/events/cocoween-card-foto.jpg",
    field: "rosa",
    caption: { en: "5-minute photo experience", es: "Mini sesión de fotos" },
    detail: {
      en: "A five-minute photo experience in the studio at Lighthill.",
      es: "Una mini sesión de fotos de cinco minutos en el estudio de Lighthill.",
    },
  },
  {
    id: "fotos",
    number: 3,
    title: "3 Fotos Digitales",
    image: "/images/events/cocoween-card-fotos.jpg",
    field: "turquesa",
    caption: { en: "3 edited digital images", es: "3 fotos digitales editadas" },
    detail: {
      en: "Three edited digital images of your child from the session.",
      es: "Tres fotos digitales editadas de tu niño de la sesión.",
    },
  },
];

export const cocoweenCopy = {
  presents: { en: "Lighthill Studio presents", es: "Lighthill Studio presenta" },
  subtitle: {
    en: "A magical Halloween & Día de los Muertos experience for kids",
    es: "Una experiencia mágica de Halloween y Día de los Muertos para niños",
  },
  date: { en: "Saturday, October 31", es: "Sábado 31 de octubre" },
  time: { en: "1:00 – 4:00 PM", es: "1:00 – 4:00 PM" },
  walkIn: { en: "Walk in any time", es: "Llega cuando quieras" },
  perChild: { en: "per child", es: "por niño" },
  children: { en: "Children", es: "Niños" },
  call: { en: "¡Lotería! Get tickets", es: "¡Lotería! Compra boletos" },
  calling: { en: "Opening checkout…", es: "Abriendo el pago…" },
  total: { en: "Total", es: "Total" },
  limited: { en: "Spots are limited", es: "¡Cupos limitados!" },
  tapCard: { en: "Tap a card to see what's included", es: "Toca una carta para ver qué incluye" },
  tabla: { en: "Every ticket includes", es: "Cada boleto incluye" },
  flyerTitle: { en: "The flyer", es: "El flyer" },
  otherFlyer: { en: "Ver el flyer en español", es: "See the flyer in English" },
  knowTitle: { en: "Good to know", es: "Lo que hay que saber" },
  know: [
    {
      q: { en: "Is the price per child?", es: "¿El precio es por niño?" },
      a: {
        en: "Yes, $60 per child. Choose how many children at checkout.",
        es: "Sí, $60 por niño. Elige cuántos niños al pagar.",
      },
    },
    {
      q: { en: "Do we need a time slot?", es: "¿Necesitamos un horario?" },
      a: {
        en: "No. Walk in any time from 1:00 to 4:00 PM on October 31.",
        es: "No. Llega cuando quieras de 1:00 a 4:00 PM el 31 de octubre.",
      },
    },
    {
      q: { en: "Where is it?", es: "¿Dónde es?" },
      a: {
        en: "Lighthill Studio, 1766 Old Norcross Rd, Ste Y, Lawrenceville, GA 30044. Free parking on site.",
        es: "Lighthill Studio, 1766 Old Norcross Rd, Ste Y, Lawrenceville, GA 30044. Estacionamiento gratis.",
      },
    },
    {
      q: { en: "What is my ticket?", es: "¿Cuál es mi boleto?" },
      a: {
        en: "Your Stripe receipt, sent to your email after you pay.",
        es: "Tu recibo de Stripe, que llega a tu correo después de pagar.",
      },
    },
  ],
  questions: { en: "Questions? Call or text", es: "¿Preguntas? Llama o escribe al" },
  closeTitle: { en: "See you on the 31st", es: "Nos vemos el 31" },
  cancelled: {
    en: "Checkout was cancelled. Nothing was charged.",
    es: "Se canceló el pago. No se cobró nada.",
  },
  unavailable: {
    en: "Online tickets aren't available right now. Call or text us to reserve.",
    es: "Los boletos en línea no están disponibles ahora. Llámanos o escríbenos para reservar.",
  },
  over: {
    en: "Cocoween has passed. Thank you for celebrating with us.",
    es: "Cocoween ya pasó. Gracias por celebrar con nosotros.",
  },
  langSwitch: { en: "Español", es: "English" },
  // Confirmation page
  thanksTitle: { en: "¡Lotería! You're in.", es: "¡Lotería! Ya tienen su lugar." },
  thanksBody: {
    en: "Your Stripe receipt is your ticket. Walk in any time from 1 to 4 PM on Saturday, October 31.",
    es: "Tu recibo de Stripe es tu boleto. Llega cuando quieras de 1 a 4 PM el sábado 31 de octubre.",
  },
  addCalendar: { en: "Add to calendar", es: "Agregar al calendario" },
  directions: { en: "Directions", es: "Cómo llegar" },
  backHome: { en: "Back to Lighthill", es: "Volver a Lighthill" },
} satisfies Record<string, Both | Both[] | Array<{ q: Both; a: Both }>>;

/** True through the event day in the studio's time zone (YYYY-MM-DD compare). */
export function cocoweenIsOn(today: string): boolean {
  return today <= cocoween.lastDay;
}
