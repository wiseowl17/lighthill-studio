import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { OWNER_EMAIL } from "./owner";
import {
  clearStripeApp,
  envStripeConfigured,
  loadStripeApp,
  saveStripeApp,
} from "./stripe.server";

async function requireOwner(userId: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`
    select email from "user" where id = ${userId} limit 1
  `;
  const email = rows[0]?.email?.toLowerCase() ?? "";
  if (email !== OWNER_EMAIL) {
    const err = new Error("Forbidden") as Error & { status: number };
    err.status = 403;
    throw err;
  }
}

export const getStripeSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireOwner(context.userId);
    const app = await loadStripeApp(context.userId);
    return {
      ready: Boolean(app?.secretKey && app.publishableKey),
      envConfigured: envStripeConfigured(),
      publishableHint: app?.publishableKey ? `${app.publishableKey.slice(0, 14)}…` : null,
      hasWebhook: Boolean(app?.webhookSecret),
      testMode: app?.secretKey ? app.secretKey.startsWith("sk_test_") : null,
    };
  });

export const saveStripeCredentials = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        publishableKey: z.string().trim().min(10),
        secretKey: z.string().trim().min(10),
        webhookSecret: z.string().trim().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    if (!data.publishableKey.startsWith("pk_")) {
      throw new Error("Publishable key should start with pk_test_ or pk_live_.");
    }
    if (!data.secretKey.startsWith("sk_")) {
      throw new Error("Secret key should start with sk_test_ or sk_live_.");
    }
    await saveStripeApp(context.userId, data.publishableKey, data.secretKey, data.webhookSecret);
    return { ok: true, testMode: data.secretKey.startsWith("sk_test_") };
  });

export const disconnectStripe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireOwner(context.userId);
    await clearStripeApp(context.userId);
    return { ok: true };
  });
