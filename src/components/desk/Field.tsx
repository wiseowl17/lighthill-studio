import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/input";

export function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function NativeSelect({
  className,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-12 w-full rounded-md border border-ink-border bg-paper px-3.5 font-sans text-sm text-ink outline-none",
        "focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15",
        className,
      )}
      {...props}
    />
  );
}
