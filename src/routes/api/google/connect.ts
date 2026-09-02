import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth/server";
import { OWNER_EMAIL } from "@/lib/studio/owner";
import {
  buildGoogleAuthUrl,
  loadGoogleApp,
  oauthCookie,
  publicOrigin,
  redirectUriFromRequest,
  signOauthState,
} from "@/lib/studio/google.server";

export const Route = createFileRoute("/api/google/connect")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = publicOrigin(request);
        const session = await auth.api.getSession({ headers: request.headers });
        const email = session?.user?.email?.toLowerCase() ?? "";
        const userId = session?.user?.id;
        if (!userId || email !== OWNER_EMAIL) {
          return Response.redirect(`${origin}/login`);
        }
        const creds = await loadGoogleApp(userId);
        if (!creds) {
          return Response.redirect(`${origin}/desk/settings?google=need-app`);
        }
        const nonce = randomBytes(16).toString("hex");
        const state = signOauthState(userId, nonce);
        const redirectUri = redirectUriFromRequest(request);
        const url = buildGoogleAuthUrl(creds.clientId, redirectUri, state);
        const secure = origin.startsWith("https://");
        return new Response(null, {
          status: 302,
          headers: {
            Location: url,
            "Set-Cookie": oauthCookie(nonce, secure),
          },
        });
      },
    },
  },
});
