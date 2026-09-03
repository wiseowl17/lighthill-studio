import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stripe/complete")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
        const { publicOrigin } = await import("@/lib/studio/google.server");
        if (sessionId) {
          try {
            const { fulfillStripeSession } = await import("@/lib/studio/rental.server");
            await fulfillStripeSession(sessionId);
          } catch (err) {
            console.error("[stripe] complete fulfill", err);
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
