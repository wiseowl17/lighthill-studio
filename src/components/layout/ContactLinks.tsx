import { Instagram, Mail, Phone } from "lucide-react";
import { site } from "@data/site";
import { cn } from "@/lib/utils";

type LinkProps = {
  className?: string;
};

export function InstagramLink({ className }: LinkProps) {
  return (
    <a
      href={site.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Instagram className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <span>{site.instagramHandle}</span>
    </a>
  );
}

export function PhoneLink({ className }: LinkProps) {
  return (
    <a
      href={`tel:${site.phone}`}
      className={cn(
        "inline-flex items-center gap-2 transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Phone className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <span>{site.phoneDisplay}</span>
    </a>
  );
}

export function EmailLink({ className }: LinkProps) {
  return (
    <a
      href={`mailto:${site.contactEmail}`}
      className={cn(
        "inline-flex items-center gap-2 transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Mail className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
      <span>{site.contactEmail}</span>
    </a>
  );
}
