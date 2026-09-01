import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
      <span className="text-fg-muted" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.25} />
      </span>
      <h1 className="font-display text-title">Something went wrong</h1>
      <p className="max-w-md text-sm leading-relaxed break-words text-fg-muted">
        {error.message || "An unexpected error occurred. Try reloading the page."}
      </p>
    </main>
  );
}
