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

