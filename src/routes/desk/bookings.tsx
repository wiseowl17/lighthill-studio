import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/desk/bookings")({
  component: BookingsLayout,
});

function BookingsLayout() {
  return <Outlet />;
}
