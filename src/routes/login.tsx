import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient, authEnabled, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getDeskStatus, seedOwnerAccount } from "@/lib/studio/fns";
import { OWNER_EMAIL } from "@/lib/studio/owner";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    try {
      await seedOwnerAccount();
    } catch {
      /* form still renders if the desk database is warming up */
    }
  },
  component: Login,
  head: () => ({
    meta: [{ title: "Desk — Lighthill Studio" }],
  }),
});

function Login() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [needsNeon, setNeedsNeon] = useState(false);

  useEffect(() => {
    void getDeskStatus()
      .then((status) => setNeedsNeon(status.hosted && status.db === "pglite"))
      .catch(() => undefined);
  }, []);

  const signedInAs = user?.primaryEmail?.toLowerCase() ?? "";
  const wrongAccount = Boolean(signedInAs && signedInAs !== OWNER_EMAIL);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      await seedOwnerAccount();
      if (!authEnabled) throw new Error("Sign-in is not enabled.");
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });
      if (authError) throw new Error(authError.message || "Could not sign in.");
      const token = (data as { token?: string } | null)?.token;
      if (token) {
        try {
          window.sessionStorage.setItem("grok-auth.bearer-token", token);
        } catch {
          /* ignore */
        }
      }
      try {
        await authClient.getSession();
      } catch {
        /* session store recovers */
      }
      await navigate({ to: "/desk" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setPending(false);
    }
  }

  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 py-16 text-fg">
      <div className="w-full max-w-sm">
        <Logo variant="white" imgClassName="mx-auto h-16" />
        <p className="mt-8 text-center text-[0.7rem] tracking-[0.22em] text-fg-muted uppercase">
          Owner desk
        </p>
        <h1 className="mt-3 text-center font-display text-4xl">Sign in</h1>
        {needsNeon ? (
          <p className="mt-5 text-center text-sm text-fg-muted">
            The live site still needs Neon Postgres. Connect it in Vercel, redeploy, then sign in here.
          </p>
        ) : null}
        {wrongAccount && !isPending ? (
          <div className="mt-5 space-y-3 text-center">
            <p className="text-sm text-fg-muted">
              Signed in as {signedInAs}. Sign out first, then use the studio Gmail.
            </p>
            <Button
              type="button"
              variant="ghost"
              className="text-fg"
              onClick={() => void signOut("/login")}
            >
              Sign out
            </Button>
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-fg-muted">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              defaultValue="studiolighthill@gmail.com"
              className="border-border-strong bg-bg-elevated text-fg placeholder:text-fg-subtle focus-visible:border-fg/40 focus-visible:ring-fg/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-fg-muted">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="border-border-strong bg-bg-elevated text-fg placeholder:text-fg-subtle focus-visible:border-fg/40 focus-visible:ring-fg/20"
            />
          </div>
          {error ? <p className="text-sm text-fg">{error}</p> : null}
          <Button type="submit" variant="primary" className="h-12 w-full" disabled={pending}>
            {pending ? "Signing in…" : "Enter the desk"}
          </Button>
        </form>
      </div>
    </main>
  );
}
