import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { nav, site } from "@data/site";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg text-fg">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Logo variant="white" imgClassName="h-16 md:h-20" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-fg-muted">
              In-house photography and a rentable cyclorama in Lawrenceville,
              Georgia. Book the team — or take the room.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
                Visit
              </p>
              <ul className="mt-4 space-y-2 text-sm text-fg-muted">
                {nav.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition-colors hover:text-fg">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
                Studio
              </p>
              <ul className="mt-4 space-y-2 text-sm text-fg-muted">
                <li>{site.location}</li>
                <li>{site.hours.weekdays}</li>
                <li>{site.hours.weekends}</li>
                <li>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 transition-colors hover:text-fg"
                  >
                    {site.instagramHandle}
                    <ArrowUpRight className="size-3" />
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
                Inquire
              </p>
              <ul className="mt-4 space-y-2 text-sm text-fg-muted">
                <li>
                  <a
                    href={`mailto:${site.contactEmail}`}
                    className="transition-colors hover:text-fg"
                  >
                    {site.contactEmail}
                  </a>
                </li>
                <li>
                  <Link
                    to="/contact"
                    search={{ type: "rental" }}
                    className="transition-colors hover:text-fg"
                  >
                    Studio rental inquiry
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-6 text-xs tracking-wide text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lighthill Studio. All rights reserved.</p>
          <p>Lawrenceville, Georgia</p>
        </div>
      </div>
    </footer>
  );
}
