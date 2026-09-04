import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getEventTickets, startTicketCheckout } from "./ticket.server";

export const listEventTickets = createServerFn({ method: "GET" }).handler(async () => {
  return getEventTickets();
});

export const startEventCheckout = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        priceId: z.string().min(3),
        quantity: z.number().int().min(1).max(10),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    return startTicketCheckout(data);
  });
