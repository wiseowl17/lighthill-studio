import { hashPassword } from "better-auth/crypto";
import { getSql } from "@/lib/db";
import { OWNER_EMAIL } from "./owner";

const OWNER_NAME = "Lighthill Studio";
const OWNER_PASSWORD = "COqPzOzpnm5$#K&";

export async function ensureOwnerAccount(): Promise<string> {
  const sql = await getSql();
  const existing = await sql<{ id: string }>`
    select id from "user" where email = ${OWNER_EMAIL} limit 1
  `;
  const id = existing[0]?.id ?? crypto.randomUUID();

  if (!existing[0]) {
    await sql`
      insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
      values (${id}, ${OWNER_NAME}, ${OWNER_EMAIL}, true, now(), now())
    `;
  }

  const cred = await sql<{ id: string }>`
    select id from "account"
    where "userId" = ${id} and "providerId" = 'credential'
    limit 1
  `;
  if (!cred[0]) {
    const hash = await hashPassword(OWNER_PASSWORD);
    await sql`
      insert into "account" (
        "id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt"
      )
      values (
        ${crypto.randomUUID()}, ${id}, 'credential', ${id}, ${hash}, now(), now()
      )
    `;
  }

  await sql`
    insert into studio_settings (user_id)
    values (${id})
    on conflict (user_id) do nothing
  `;
  return id;
}

export async function ownerIdOrNull(): Promise<string | null> {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from "user" where email = ${OWNER_EMAIL} limit 1
  `;
  return rows[0]?.id ?? null;
}
