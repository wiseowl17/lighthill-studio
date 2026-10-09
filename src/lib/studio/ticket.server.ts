import { publicOrigin } from "./google.server";
import {
  createPriceCheckoutSession,
  findEventPrice,
  listOneTimePrices,
  loadStripeApp,
} from "./stripe.server";

async function resolveOrigin(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    if (request) return publicOrigin(request);
  } catch {
    /* keep studio origin */
  }
  return "https://lighthillstudio.com";
}

async function ownerUserId(): Promise<string> {
  const { ensureOwnerAccount } = await import("./ensure-owner.server");
  return ensureOwnerAccount();
}

export async function getEventTickets() {
  const userId = await ownerUserId();
  const stripe = await loadStripeApp(userId);
  if (!stripe) return { ready: false as const, tickets: [] };
  try {
    const tickets = await listOneTimePrices(stripe.secretKey);
    return { ready: true as const, tickets };
  } catch (err) {
    console.error("[stripe] list tickets", err);
    return { ready: true as const, tickets: [] };
  }
}

export async function startTicketCheckout(input: { priceId: string; quantity: number }) {
  const quantity = Math.min(10, Math.max(1, Math.round(input.quantity)));
  const userId = await ownerUserId();
  const stripe = await loadStripeApp(userId);
  if (!stripe) throw new Error("Stripe is not connected.");
  const tickets = await listOneTimePrices(stripe.secretKey);
  const ticket = tickets.find((row) => row.priceId === input.priceId);
  if (!ticket) throw new Error("That ticket is no longer available.");
  const origin = await resolveOrigin();
  const session = await createPriceCheckoutSession(stripe.secretKey, {
    priceId: ticket.priceId,
    quantity,
    name: `${ticket.name} × ${quantity}`,
    successUrl: `${origin}/colorful/confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/colorful?cancelled=1`,
    origin,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { url: session.url };
}

/**
 * Events sold from /event. Keep keys here, not in @data: *.server.ts files
 * must never import client data modules (that crashed SSR once).
 */
const EVENT_PAGES = {
  cocoween: { path: "/event", label: "Cocoween" },
} as const;
export type EventKey = keyof typeof EVENT_PAGES;

export async function getEventTicket(eventKey: EventKey) {
  const userId = await ownerUserId();
  const stripe = await loadStripeApp(userId);
  if (!stripe) return { ready: false as const, ticket: null };
  try {
    return { ready: true as const, ticket: await findEventPrice(stripe.secretKey, eventKey) };
  } catch (err) {
    console.error("[stripe] event ticket", eventKey, err);
    return { ready: true as const, ticket: null };
  }
}

export async function startEventTicketCheckout(input: {
  eventKey: EventKey;
  quantity: number;
  lang: "en" | "es";
}) {
  const quantity = Math.min(20, Math.max(1, Math.round(input.quantity)));
  const page = EVENT_PAGES[input.eventKey];
  const userId = await ownerUserId();
  const stripe = await loadStripeApp(userId);
  if (!stripe) throw new Error("Stripe is not connected.");
  const ticket = await findEventPrice(stripe.secretKey, input.eventKey);
  if (!ticket) throw new Error("Tickets are not on sale right now.");
  const origin = await resolveOrigin();
  const es = input.lang === "es";
  const session = await createPriceCheckoutSession(stripe.secretKey, {
    priceId: ticket.priceId,
    quantity,
    name: `${page.label} × ${quantity}`,
    successUrl: `${origin}${page.path}/confirmed?session_id={CHECKOUT_SESSION_ID}${es ? "" : "&lang=en"}`,
    cancelUrl: `${origin}${page.path}?cancelled=1${es ? "" : "&lang=en"}`,
    origin,
    metadata: { event: input.eventKey, children: String(quantity) },
    textField: {
      key: "children",
      label: es ? "Nombre(s) de los niños" : "Children's names",
    },
    submitMessage: es
      ? "Tu recibo de Stripe es tu boleto. Llega cuando quieras de 1 a 4 PM."
      : "Your Stripe receipt is your ticket. Walk in any time from 1 to 4 PM.",
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { url: session.url };
}
