import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { OWNER_EMAIL } from "./owner";
import {
  listGoogleFloorEvents,
  listWritableCalendars,
  setTargetCalendar,
  type GoogleFloorEvent,
} from "./google.server";

export type { GoogleFloorEvent };

async function requireOwner(userId: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`
    select email from "user" where id = ${userId} limit 1
  `;
  const email = rows[0]?.email?.toLowerCase() ?? "";
  if (email !== OWNER_EMAIL) {
    const err = new Error("Forbidden") as Error & { status: number };
    err.status = 403;
    throw err;
  }
}

export const listGoogleCalendars = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireOwner(context.userId);
    return listWritableCalendars(context.userId);
  });

export const saveGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ calendarId: z.string().min(1) }).parse(d))
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    return setTargetCalendar(context.userId, data.calendarId);
  });

export const listGoogleEvents = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ from: z.string(), to: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireOwner(context.userId);
    return listGoogleFloorEvents(context.userId, data.from, data.to);
  });
