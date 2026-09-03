import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { site } from "@data/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "outline"
  | "invert"
  | "ghost"
  | "paper"
  | "paperOutline";

type CtaPairProps = {
  className?: string;
  shootVariant?: ButtonVariant;
  rentVariant?: ButtonVariant;
  stacked?: boolean;
};

export function CtaPair({
  className,
  shootVariant = "primary",
  rentVariant = "outline",
  stacked = false,
}: CtaPairProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "grid gap-3",
          stacked ? "w-full grid-cols-1" : "w-full grid-cols-1 sm:inline-grid sm:w-max sm:grid-cols-2",
        )}
      >
        <Button variant={shootVariant} size="lg" className="w-full" asChild>
          <Link to="/contact" search={{ type: "shoot" }}>
            Book a Shoot
          </Link>
        </Button>
        <Button variant={rentVariant} size="lg" className="w-full" asChild>
          <Link to="/rent">Rent now</Link>
        </Button>
      </div>
      <Button
        variant={stacked ? "outline" : "ghost"}
        size="lg"
        className={cn("w-full", !stacked && "sm:w-max")}
        asChild
      >
        <a href={site.peerspaceUrl} target="_blank" rel="noopener noreferrer">
          Book with Peerspace
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
        </a>
      </Button>
    </div>
  );
}
