import { Link } from "@tanstack/react-router";
import { nav, site } from "@data/site";
import { Logo } from "@/components/layout/Logo";
import { CtaPair } from "@/components/layout/CtaPair";
import {
  EmailLink,
  InstagramLink,
  PhoneLink,
} from "@/components/layout/ContactLinks";
import { useI18n } from "@/lib/i18n/provider";

export function Footer() {
  const { copy } = useI18n();
  return (
    <footer className="border-t border-border bg-bg text-fg">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Logo variant="white" imgClassName="h-16 md:h-20" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-fg-muted">
              {copy.footer.blurb}
            </p>
            <CtaPair className="mt-8" />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
                {copy.footer.visit}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-fg-muted">
                {nav.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="transition-colors hover:text-fg">
                      {copy.nav[item.id]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
                {copy.footer.studio}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-fg-muted">
                <li>{site.location}</li>
                <li>{site.hours.weekdays}</li>
                <li>{site.hours.weekends}</li>
              </ul>
            </div>
            <div>
              <p className="text-[0.68rem] font-medium tracking-[0.16em] text-fg-subtle uppercase">
                {copy.footer.inquire}
              </p>
              <ul className="mt-4 space-y-3 text-sm text-fg-muted">
                <li>
                  <EmailLink />
                </li>
                <li>
                  <PhoneLink />
                </li>
                <li>
                  <InstagramLink />
                </li>
                <li>
                  <Link
                    to="/contact"
                    search={{ type: "rental" }}
                    className="transition-colors hover:text-fg"
                  >
                    {copy.footer.rentalInquiry}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-6 text-xs tracking-wide text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Lighthill Studio. {copy.footer.rights}
          </p>
          <InstagramLink className="text-fg-subtle hover:text-fg" />
        </div>
      </div>
    </footer>
  );
}
