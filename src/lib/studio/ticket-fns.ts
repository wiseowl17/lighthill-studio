import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getEventTicket,
  getEventTickets,
  startEventTicketCheckout,
  startTicketCheckout,
} from "./ticket.server";

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

export const getEventTicketFn = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ eventKey: z.enum(["cocoween"]) }).parse(d))
  .handler(async ({ data }) => getEventTicket(data.eventKey));

export const startEventTicketCheckoutFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        eventKey: z.enum(["cocoween"]),
        quantity: z.number().int().min(1).max(20),
        lang: z.enum(["en", "es"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => startEventTicketCheckout(data));
