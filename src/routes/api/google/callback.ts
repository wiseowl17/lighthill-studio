import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth/server";
import { OWNER_EMAIL } from "@/lib/studio/owner";
import {
  completeGoogleConnect,
  oauthCookie,
  publicOrigin,
  readOauthNonce,
  redirectUriFromRequest,
  verifyOauthState,
} from "@/lib/studio/google.server";

function bounce(origin: string, code: string, secure: boolean): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${origin}/desk/settings?google=${encodeURIComponent(code)}`,
      "Set-Cookie": oauthCookie("", secure, 0),
    },
  });
}

export const Route = createFileRoute("/api/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = publicOrigin(request);
        const secure = origin.startsWith("https://");
        const url = new URL(request.url);
        const error = url.searchParams.get("error");
        if (error) return bounce(origin, error === "access_denied" ? "denied" : "error", secure);

        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const nonce = readOauthNonce(request);
        if (!code || !state || !nonce) return bounce(origin, "error", secure);

        const parsed = verifyOauthState(state, nonce);
        if (!parsed) return bounce(origin, "error", secure);

        const session = await auth.api.getSession({ headers: request.headers });
        const email = session?.user?.email?.toLowerCase() ?? "";
        if (!session?.user?.id || session.user.id !== parsed.userId || email !== OWNER_EMAIL) {
          return bounce(origin, "error", secure);
        }

        try {
          await completeGoogleConnect(parsed.userId, code, redirectUriFromRequest(request));
          return bounce(origin, "connected", secure);
        } catch (err) {
          console.error("[gcal] connect", err);
          return bounce(origin, "error", secure);
        }
      },
    },
  },
});
