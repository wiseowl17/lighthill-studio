import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-md border border-ink-border bg-paper px-3.5 font-sans text-sm text-ink outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-ink-subtle",
        "focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-36 w-full resize-y rounded-md border border-ink-border bg-paper px-3.5 py-3 font-sans text-sm text-ink outline-none transition-[box-shadow,border-color] duration-150 placeholder:text-ink-subtle",
        "focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-[0.68rem] font-medium uppercase tracking-[0.16em] text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea, Label };
