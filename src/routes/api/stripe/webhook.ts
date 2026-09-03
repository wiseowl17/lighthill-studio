import { createFileRoute } from "@tanstack/react-router";
import { loadStripeApp, verifyStripeSignature } from "@/lib/studio/stripe.server";
import { fulfillStripeSession } from "@/lib/studio/rental.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text();
        const signature = request.headers.get("stripe-signature") ?? "";
        const { ensureOwnerAccount } = await import("@/lib/studio/ensure-owner.server");
        const userId = await ensureOwnerAccount();
        const app = await loadStripeApp(userId);
        if (app?.webhookSecret) {
          if (!verifyStripeSignature(payload, signature, app.webhookSecret)) {
            return new Response("invalid signature", { status: 400 });
          }
        }
        let event: { type?: string; data?: { object?: { id?: string } } };
        try {
          event = JSON.parse(payload) as typeof event;
        } catch {
          return new Response("invalid json", { status: 400 });
        }
        if (event.type === "checkout.session.completed") {
          const sessionId = event.data?.object?.id;
          if (sessionId) {
            try {
              await fulfillStripeSession(sessionId);
            } catch (err) {
              console.error("[stripe] fulfill", err);
              return new Response("fulfill failed", { status: 500 });
            }
          }
        }
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
