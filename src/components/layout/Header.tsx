import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ArrowUpRight } from "lucide-react";
import { nav } from "@data/site";
import { site } from "@data/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/Logo";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        solid
          ? "bg-bg/92 shadow-[var(--shadow-border)] backdrop-blur-md"
          : "bg-linear-to-b from-bg/85 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-20 md:px-8">
        <div className="flex items-center gap-1">
          <Logo variant="white" imgClassName="h-10 md:h-12" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex size-11 items-center justify-center text-fg lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-6" strokeWidth={1.25} />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex h-full flex-col px-6 pt-20 pb-10">
                <Logo variant="white" imgClassName="h-14" />
                <nav className="mt-12 flex flex-col gap-1" aria-label="Mobile">
                  {nav.map((item) => (
                    <SheetClose asChild key={item.to}>
                      <Link
                        to={item.to}
                        className="py-3 font-display text-4xl text-fg"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto flex flex-col gap-3">
                  <Button variant="primary" size="lg" asChild>
                    <Link to="/contact" search={{ type: "shoot" }}>
                      Book a Shoot
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a
                      href={site.peerspaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Rent the Space
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors duration-150",
                pathname === item.to
                  ? "text-fg"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="outline" size="lg" asChild>
            <a
              href={site.peerspaceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Rent the Space
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </a>
          </Button>
          <Button variant="primary" size="lg" asChild>
            <Link to="/contact" search={{ type: "shoot" }}>
              Book a Shoot
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
