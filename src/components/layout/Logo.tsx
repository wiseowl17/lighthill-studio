import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "white" | "black";
  className?: string;
  imgClassName?: string;
};

export function Logo({
  variant = "white",
  className,
  imgClassName,
}: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Lighthill Studio home"
      className={cn("inline-flex items-center", className)}
    >
      <img
        src={
          variant === "white"
            ? "/brand/logo-white.png"
            : "/brand/logo-black.png"
        }
        alt="Lighthill Studio"
        className={cn(
          "h-10 w-auto outline-none md:h-12",
          imgClassName,
        )}
      />
    </Link>
  );
}
