import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  ClipboardList,
  Inbox,
  LogOut,
  Plus,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/desk", label: "Calendar", icon: CalendarDays },
  { to: "/desk/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/desk/clients", label: "Clients", icon: Users },
  { to: "/desk/invoices", label: "Invoices", icon: Receipt },
  { to: "/desk/inbox", label: "Inbox", icon: Inbox },
  { to: "/desk/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, to: (typeof links)[number]["to"]) {
  if (to === "/desk") return pathname === "/desk" || pathname === "/desk/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function DeskShell({
  children,
  email,
}: {
  children: ReactNode;
  email: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="scheme-light min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-ink-border bg-paper/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:h-18 md:px-6">
          <div className="flex items-center gap-3">
            <Logo variant="black" imgClassName="h-9 md:h-10" />
            <Link
              to="/desk"
              className="hidden text-[0.68rem] tracking-[0.18em] text-ink-muted uppercase sm:block"
            >
              Desk
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="invert" size="sm" className="h-11 px-4" asChild>
              <Link to="/desk/new">
                <Plus className="size-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">New booking</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
            <Link
              to="/desk/settings"
              className="flex size-11 items-center justify-center text-ink-muted hover:text-ink md:hidden"
              aria-label="Settings"
            >
              <Settings className="size-5" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              className="hidden h-11 items-center gap-2 px-3 text-xs tracking-[0.12em] text-ink-muted uppercase hover:text-ink md:inline-flex"
              onClick={() => void signOut("/login")}
            >
              <LogOut className="size-4" strokeWidth={1.5} />
              Sign out
            </button>
          </div>
        </div>
        <nav
          className="mx-auto hidden max-w-7xl gap-1 px-4 pb-3 md:flex md:px-6"
          aria-label="Desk"
        >
          {links.map((link) => {
            const active = isActive(pathname, link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "inline-flex h-10 items-center gap-2 px-3 text-[0.7rem] tracking-[0.14em] uppercase transition-colors",
                  active ? "bg-ink text-paper" : "text-ink-muted hover:text-ink",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.5} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-4 py-8 pb-28 md:px-6 md:pb-12">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-border bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Desk mobile"
      >
        <div className="grid grid-cols-5">
          {links.slice(0, 5).map((link) => {
            const active = isActive(pathname, link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[0.58rem] tracking-[0.12em] uppercase",
                  active ? "text-ink" : "text-ink-muted",
                )}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <p className="sr-only">{email}</p>
    </div>
  );
}
