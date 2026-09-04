import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";

function envTrim(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value || undefined;
}

function signingSecret(): string {
  return envTrim("BETTER_AUTH_SECRET") ?? envTrim("STRIPE_SECRET_KEY") ?? "lighthill-preview";
}

function encKey(): Buffer {
  return createHash("sha256").update(`stripe:${signingSecret()}`).digest();
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}.${tag.toString("hex")}.${enc.toString("hex")}`;
}

function decrypt(payload: string): string {
  if (!payload.includes(".")) return payload;
  const [ivH, tagH, dataH] = payload.split(".");
  const decipher = createDecipheriv("aes-256-gcm", encKey(), Buffer.from(ivH, "hex"));
  decipher.setAuthTag(Buffer.from(tagH, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataH, "hex")), decipher.final()]).toString("utf8");
}

export type StripeApp = {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string | null;
};

export function envStripeConfigured(): boolean {
  return Boolean(envTrim("STRIPE_SECRET_KEY") && envTrim("STRIPE_PUBLISHABLE_KEY"));
}

export async function loadStripeApp(userId: string): Promise<StripeApp | null> {
  const envPk = envTrim("STRIPE_PUBLISHABLE_KEY");
  const envSk = envTrim("STRIPE_SECRET_KEY");
  const envWh = envTrim("STRIPE_WEBHOOK_SECRET");
  if (envPk && envSk) {
    return { publishableKey: envPk, secretKey: envSk, webhookSecret: envWh ?? null };
  }
  const sql = await getSql();
  try {
    const rows = await sql<{
      stripe_publishable_key: string | null;
      stripe_secret_key: string | null;
      stripe_webhook_secret: string | null;
    }>`
      select stripe_publishable_key, stripe_secret_key, stripe_webhook_secret
      from studio_settings where user_id = ${userId} limit 1
    `;
    const pk = rows[0]?.stripe_publishable_key?.trim();
    const skEnc = rows[0]?.stripe_secret_key?.trim();
    if (!pk || !skEnc) return null;
    const secretKey = decrypt(skEnc);
    const webhookSecret = rows[0]?.stripe_webhook_secret
      ? decrypt(rows[0].stripe_webhook_secret)
      : null;
    return { publishableKey: pk, secretKey, webhookSecret };
  } catch {
    return null;
  }
}

export async function saveStripeApp(
  userId: string,
  publishableKey: string,
  secretKey: string,
  webhookSecret?: string,
): Promise<void> {
  const sql = await getSql();
  const wh = webhookSecret?.trim() ? encrypt(webhookSecret.trim()) : null;
  await sql`
    insert into studio_settings (user_id, stripe_publishable_key, stripe_secret_key, stripe_webhook_secret)
    values (${userId}, ${publishableKey.trim()}, ${encrypt(secretKey.trim())}, ${wh})
    on conflict (user_id) do update set
      stripe_publishable_key = excluded.stripe_publishable_key,
      stripe_secret_key = excluded.stripe_secret_key,
      stripe_webhook_secret = coalesce(excluded.stripe_webhook_secret, studio_settings.stripe_webhook_secret)
  `;
}

export async function clearStripeApp(userId: string): Promise<void> {
  const sql = await getSql();
  await sql`
    update studio_settings set
      stripe_publishable_key = null,
      stripe_secret_key = null,
      stripe_webhook_secret = null
    where user_id = ${userId}
  `;
}

export function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((piece) => {
      const [k, v] = piece.split("=");
      return [k.trim(), v ?? ""];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 60 * 5) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  if (expected.length !== signature.length) return false;
  return (
    createHmac("sha256", "cmp").update(expected).digest("hex") ===
    createHmac("sha256", "cmp").update(signature).digest("hex")
  );
}

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  status: string | null;
  payment_status: string | null;
  amount_total: number | null;
  payment_intent: string | { id?: string } | null;
  metadata: { bookingId?: string; kind?: string } | null;
  client_reference_id: string | null;
  customer_email: string | null;
};

function formBody(fields: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === "") continue;
    params.append(key, String(value));
  }
  return params.toString();
}

async function stripeRequest<T>(
  secretKey: string,
  method: string,
  path: string,
  fields?: Record<string, string | number | undefined>,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    ...extraHeaders,
  };
  const init: RequestInit = { method, headers };
  if (method !== "GET" && fields) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    init.body = formBody(fields);
  }
  const response = await fetch(`https://api.stripe.com/v1/${path}`, init);
  const json = (await response.json()) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message ?? "Stripe request failed.");
  }
  return json;
}

export async function createCheckoutSession(
  secretKey: string,
  input: {
    amountCents: number;
    name: string;
    description: string;
    email: string;
    bookingId: string;
    successUrl: string;
    cancelUrl: string;
    expiresAt: number;
    origin: string;
  },
): Promise<StripeCheckoutSession> {
  const origin = input.origin.replace(/\/$/, "");
  const base: Record<string, string | number | undefined> = {
    mode: "payment",
    "line_items[0][quantity]": 1,
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": input.amountCents,
    "line_items[0][price_data][product_data][name]": input.name,
    "line_items[0][price_data][product_data][description]": input.description,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: input.email,
    "payment_intent_data[receipt_email]": input.email,
    client_reference_id: input.bookingId,
    "metadata[bookingId]": input.bookingId,
    "payment_intent_data[metadata][bookingId]": input.bookingId,
    "payment_intent_data[description]": input.description,
    expires_at: input.expiresAt,
    allow_promotion_codes: "true",
    "custom_text[submit][message]":
      "This is the 50% deposit. The remaining balance is due when you arrive at the studio.",
    "custom_text[after_submit][message]":
      "You're booked. Stripe will email a receipt for the deposit. The rest is due at the studio.",
  };
  const branded = {
    ...base,
    "branding_settings[background_color]": "#f4f1ea",
    "branding_settings[button_color]": "#141210",
    "branding_settings[font_family]": "lora",
    "branding_settings[border_style]": "rectangular",
    "branding_settings[logo][type]": "url",
    "branding_settings[logo][url]": `${origin}/brand/checkout-logo.png`,
  };
  try {
    return await stripeRequest<StripeCheckoutSession>(
      secretKey,
      "POST",
      "checkout/sessions",
      branded,
      { "Stripe-Version": "2025-09-30.clover" },
    );
  } catch (err) {
    console.error("[stripe] branded checkout failed", err);
    return stripeRequest<StripeCheckoutSession>(secretKey, "POST", "checkout/sessions", base);
  }
}

export async function retrieveCheckoutSession(
  secretKey: string,
  sessionId: string,
): Promise<StripeCheckoutSession> {
  return stripeRequest<StripeCheckoutSession>(
    secretKey,
    "GET",
    `checkout/sessions/${encodeURIComponent(sessionId)}`,
  );
}

export function paymentIntentId(value: StripeCheckoutSession["payment_intent"]): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (value && typeof value === "object" && typeof value.id === "string") return value.id;
  return null;
}

export type StripeProductPrice = {
  productId: string;
  priceId: string;
  name: string;
  description: string | null;
  amountCents: number;
  image: string | null;
};

type StripeProduct = {
  id: string;
  name: string;
  description: string | null;
  images?: string[];
  metadata?: Record<string, string>;
};

type StripePrice = {
  id: string;
  unit_amount: number | null;
  product: string | { id?: string };
  type?: string;
  nickname: string | null;
};

function productIdOf(product: StripePrice["product"]): string {
  if (typeof product === "string") return product;
  return product?.id ?? "";
}

function looksLikeEventTicket(product: StripeProduct): boolean {
  const blob = `${product.name} ${product.description ?? ""} ${product.metadata?.event ?? ""} ${product.metadata?.kind ?? ""}`.toLowerCase();
  return /colorful|ticket|boleto|experience|evento/.test(blob);
}

export async function listOneTimePrices(secretKey: string): Promise<StripeProductPrice[]> {
  const productsRes = await stripeRequest<{ data: StripeProduct[] }>(
    secretKey,
    "GET",
    "products?active=true&limit=100",
  );
  const pricesRes = await stripeRequest<{ data: StripePrice[] }>(
    secretKey,
    "GET",
    "prices?active=true&limit=100",
  );
  const products = new Map(productsRes.data.map((product) => [product.id, product]));
  const rows: StripeProductPrice[] = [];
  for (const price of pricesRes.data) {
    if (price.type && price.type !== "one_time") continue;
    if (!price.unit_amount || price.unit_amount <= 0) continue;
    const product = products.get(productIdOf(price.product));
    if (!product) continue;
    rows.push({
      productId: product.id,
      priceId: price.id,
      name: price.nickname?.trim() || product.name,
      description: product.description,
      amountCents: price.unit_amount,
      image: product.images?.[0] ?? null,
    });
  }
  const eventRows = rows.filter((row) => {
    const product = products.get(row.productId);
    return product ? looksLikeEventTicket(product) : false;
  });
  const picked = eventRows.length > 0 ? eventRows : rows;
  return picked.sort((a, b) => a.amountCents - b.amountCents);
}

export async function createPriceCheckoutSession(
  secretKey: string,
  input: {
    priceId: string;
    quantity: number;
    name: string;
    successUrl: string;
    cancelUrl: string;
    origin: string;
  },
): Promise<StripeCheckoutSession> {
  const origin = input.origin.replace(/\/$/, "");
  const base: Record<string, string | number | undefined> = {
    mode: "payment",
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": input.quantity,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "metadata[kind]": "ticket",
    "payment_intent_data[metadata][kind]": "ticket",
    "payment_intent_data[description]": input.name,
    allow_promotion_codes: "true",
    "custom_text[submit][message]": "Your ticket confirmation is the Stripe receipt.",
  };
  const branded = {
    ...base,
    "branding_settings[background_color]": "#f4f1ea",
    "branding_settings[button_color]": "#141210",
    "branding_settings[font_family]": "lora",
    "branding_settings[border_style]": "rectangular",
    "branding_settings[logo][type]": "url",
    "branding_settings[logo][url]": `${origin}/brand/checkout-logo.png`,
  };
  try {
    return await stripeRequest<StripeCheckoutSession>(
      secretKey,
      "POST",
      "checkout/sessions",
      branded,
      { "Stripe-Version": "2025-09-30.clover" },
    );
  } catch (err) {
    console.error("[stripe] branded ticket checkout failed", err);
    return stripeRequest<StripeCheckoutSession>(secretKey, "POST", "checkout/sessions", base);
  }
}
