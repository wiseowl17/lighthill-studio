import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const listRentalAvailability = createServerFn({ method: "GET" })
  .validator((d: unknown) =>
    z.object({ durationMinutes: z.number().int().min(60).max(12 * 60) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { getRentalAvailability } = await import("./rental.server");
    return getRentalAvailability(data.durationMinutes);
  });

export const startRentalCheckout = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        durationMinutes: z.number().int().min(60).max(12 * 60),
        guestCount: z.number().int().min(1).max(20),
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(180),
        phone: z.string().trim().max(40).optional(),
        addons: z.array(z.object({ id: z.string(), qty: z.number().int().nonnegative() })),
        notes: z.string().trim().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { startRentalCheckoutSession } = await import("./rental.server");
    return startRentalCheckoutSession(data);
  });

export const confirmRentalCheckout = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ sessionId: z.string().min(8) }).parse(d))
  .handler(async ({ data }) => {
    const { getConfirmedRental } = await import("./rental.server");
    return getConfirmedRental(data.sessionId);
  });
