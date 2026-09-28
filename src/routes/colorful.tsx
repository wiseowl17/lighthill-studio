import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/colorful")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
