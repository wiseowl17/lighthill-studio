import { publicOrigin } from "./google.server";
import { createPriceCheckoutSession, listOneTimePrices, loadStripeApp } from "./stripe.server";

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

export async function startTicketCheckout(input: {
  priceId: string;
  quantity: number;
}) {
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
