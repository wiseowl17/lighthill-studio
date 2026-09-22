import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PeerspaceMark } from "@/components/layout/PeerspaceMark";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

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
  const { copy } = useI18n();
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        stacked ? "w-full flex-col" : "flex-wrap",
        className,
      )}
    >
      <div
        className={cn(
          "grid gap-3",
          stacked ? "w-full grid-cols-1" : "w-full grid-cols-1 sm:inline-grid sm:w-max sm:grid-cols-2",
        )}
      >
        <Button variant={shootVariant} size="xl" className="w-full" asChild>
          <Link to="/contact" search={{ type: "shoot" }}>
            {copy.cta.shoot}
          </Link>
        </Button>
        <Button variant={rentVariant} size="xl" className="w-full" asChild>
          <Link to="/rent">{copy.cta.rent}</Link>
        </Button>
      </div>
      <PeerspaceMark className={cn(stacked ? "self-start" : "shrink-0")} />
    </div>
  );
}
