import { site } from "@data/site";
import { cn } from "@/lib/utils";

type PeerspaceMarkProps = {
  className?: string;
  iconClassName?: string;
};

export function PeerspaceMark({ className, iconClassName }: PeerspaceMarkProps) {
  return (
    <a
      href={site.peerspaceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book on Peerspace"
      title="Book on Peerspace"
      className={cn(
        "inline-flex items-center justify-center transition-opacity duration-150 hover:opacity-80",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        className={cn("h-8 w-8", iconClassName)}
        aria-hidden
      >
        <rect width="32" height="32" rx="8" fill="#A578FF" />
        <path
          fill="#fff"
          d="M10.2 7.2h8.05c4.22 0 6.95 2.28 6.95 6.02 0 3.78-2.73 6.1-6.95 6.1h-3.72V24.8H10.2V7.2zm4.33 8.42h3.4c1.82 0 2.92-.96 2.92-2.4 0-1.42-1.1-2.34-2.92-2.34h-3.4v4.74z"
        />
      </svg>
    </a>
  );
}
