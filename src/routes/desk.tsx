import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDeskSession, seedOwnerAccount } from "@/lib/studio/fns";
import { DeskShell } from "@/components/desk/DeskShell";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/desk")({
  beforeLoad: async () => {
    await seedOwnerAccount();
  },
  component: DeskLayout,
  head: () => ({
    meta: [{ title: "Desk — Lighthill Studio" }],
  }),
});

function DeskLayout() {
  const { user, isPending } = useCurrentUserState();
  const [owner, setOwner] = useState<{ email: string; isOwner: boolean } | null>(
    null,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setReady(true);
      setOwner(null);
      return;
    }
    void getDeskSession()
      .then((session) => {
        setOwner({ email: session.email, isOwner: session.isOwner });
      })
      .catch(() => setOwner(null))
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
  if (!owner?.isOwner) {
    return (
      <div className="scheme-light flex min-h-dvh flex-col items-center justify-center bg-paper px-5 text-center text-ink">
        <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">
          Desk
        </p>
        <h1 className="mt-4 font-display text-4xl">This login is not an owner.</h1>
        <p className="mt-4 max-w-md text-ink-muted">
          Sign in with the studio Gmail to manage the floor.
        </p>
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
    <DeskShell email={owner.email}>
      <Outlet />
    </DeskShell>
  );
}
