import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { nav } from "@data/site";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/layout/Logo";
import { CtaPair } from "@/components/layout/CtaPair";
import { InstagramLink, PhoneLink } from "@/components/layout/ContactLinks";
import { useI18n } from "@/lib/i18n/provider";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { copy } = useI18n();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = !isHome || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        solid
          ? "bg-bg/92 shadow-[var(--shadow-border)] backdrop-blur-md"
          : "bg-linear-to-b from-bg/85 to-transparent",
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-center px-5 md:h-24 md:px-8 lg:h-20 lg:justify-between">
          <div className="flex items-center gap-1 md:gap-2">
            <Logo variant="white" imgClassName="h-16 md:h-20 lg:h-12" />
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex size-12 items-center justify-center text-fg lg:hidden md:size-14"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? (
                  <X className="size-7 md:size-8" strokeWidth={1.25} />
                ) : (
                  <Menu className="size-7 md:size-8" strokeWidth={1.25} />
                )}
              </button>
            </SheetTrigger>
          </div>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors duration-150",
                  pathname === item.to || (item.to === "/colorful" && pathname.startsWith("/colorful"))
                    ? "text-fg"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {copy.nav[item.id]}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <CtaPair />
          </div>
        </div>

        <SheetContent hideClose>
          <div className="flex h-full flex-col overflow-y-auto px-6 pt-6 pb-10">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {nav.map((item) => (
                <SheetClose asChild key={item.to}>
                  <Link
                    to={item.to}
                    className="py-3 font-display text-4xl text-fg"
                  >
                    {copy.nav[item.id]}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-5">
              <CtaPair stacked />
              <div className="flex flex-col gap-3 text-sm text-fg-muted">
                <PhoneLink />
                <InstagramLink />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
