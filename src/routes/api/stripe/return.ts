import { createFileRoute } from "@tanstack/react-router";
import { publicOrigin } from "@/lib/studio/google.server";
import { fulfillStripeSession } from "@/lib/studio/rental.server";

export const Route = createFileRoute("/api/stripe/return")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
        if (sessionId) {
          try {
            await fulfillStripeSession(sessionId);
          } catch (err) {
            console.error("[stripe] return fulfill", err);
          }
        }
        const origin = publicOrigin(request);
        const next = new URL("/rent/confirmed", origin);
        if (sessionId) next.searchParams.set("session_id", sessionId);
        return new Response(null, {
          status: 303,
          headers: { Location: next.toString() },
        });
      },
    },
  },
});
