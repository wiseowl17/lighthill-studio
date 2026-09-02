import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDeskSession, getDeskStatus, seedOwnerAccount } from "@/lib/studio/fns";
import { DeskShell } from "@/components/desk/DeskShell";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({
  beforeLoad: async () => {
    try {
      await seedOwnerAccount();
    } catch {
      /* RedirectToSignIn handles an unready desk */
    }
  },
  component: DeskLayout,
  head: () => ({
    meta: [{ title: "Desk — Lighthill Studio" }],
  }),
});

type DeskGate = {
  email: string;
  isOwner: boolean;
  db: "neon" | "pglite";
  hosted: boolean;
  failed: boolean;
};

function DeskLayout() {
  const { user, isPending } = useCurrentUserState();
  const [gate, setGate] = useState<DeskGate | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setReady(true);
      setGate(null);
      return;
    }
    void Promise.all([
      getDeskSession().catch(() => null),
      getDeskStatus().catch(() => null),
    ])
      .then(([session, status]) => {
        const db = session?.db ?? status?.db ?? "pglite";
        const hosted = session?.hosted ?? status?.hosted ?? false;
        if (!session) {
          setGate({
            email: user.primaryEmail?.toLowerCase() ?? "",
            isOwner: false,
            db,
            hosted,
            failed: true,
          });
          return;
        }
        setGate({
          email: session.email || user.primaryEmail?.toLowerCase() || "",
          isOwner: session.isOwner,
          db: session.db,
          hosted: session.hosted,
          failed: false,
        });
      })
      .finally(() => setReady(true));
  }, [user, isPending]);

  if (isPending || !ready) {
    return (
      <div className="scheme-light flex min-h-dvh items-center justify-center bg-paper text-ink-muted">
        Opening the desk…
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!gate?.isOwner) {
    const needsNeon = Boolean(gate?.hosted && gate.db === "pglite");
    const signedInAs = gate?.email || user.primaryEmail;
    return (
      <div className="scheme-light flex min-h-dvh flex-col items-center justify-center bg-paper px-5 text-center text-ink">
        <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">
          Desk
        </p>
        <h1 className="mt-4 font-display text-4xl">
          {needsNeon ? "The desk needs its database." : "This login is not an owner."}
        </h1>
        <p className="mt-4 max-w-md text-ink-muted">
          {needsNeon
            ? "The live site is still running without Neon Postgres, so owner sessions cannot stick. Connect Neon to the Vercel project, redeploy, then sign in with the studio Gmail."
            : "Sign in with the studio Gmail to manage the floor."}
        </p>
        {signedInAs ? (
          <p className="mt-3 text-sm text-ink-muted">
            Currently signed in as {signedInAs}
          </p>
        ) : null}
        <Button
          className="mt-8"
          variant="invert"
          onClick={() => void signOut("/login")}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <DeskShell email={gate.email}>
      <Outlet />
    </DeskShell>
  );
}
