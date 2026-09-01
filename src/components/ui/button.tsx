import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/40 disabled:pointer-events-none disabled:opacity-50 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-fg hover:bg-fg shadow-[var(--shadow-border)]",
        outline:
          "border border-border-strong bg-transparent text-fg hover:bg-fg/10",
        invert:
          "bg-ink text-paper hover:bg-bg-elevated border border-transparent",
        ghost: "bg-transparent text-fg hover:text-fg/80",
        paper:
          "bg-paper text-ink hover:bg-paper-muted shadow-[var(--shadow-paper)]",
        paperOutline:
          "border border-ink-border bg-transparent text-ink hover:bg-ink/5",
      },
      size: {
        default: "h-11 px-5 text-sm",
        lg: "h-12 px-7 text-[0.7rem] uppercase tracking-[0.18em]",
        sm: "h-9 px-3.5 text-xs",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
