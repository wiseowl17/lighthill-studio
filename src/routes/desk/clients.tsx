import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/desk/Field";
import { listClients, saveClient } from "@/lib/studio/fns";
import { formatWhen } from "@/lib/studio/time";

export const Route = createFileRoute("/desk/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listClients>>>([]);
  const [open, setOpen] = useState(false);

  function reload() {
    void listClients().then(setRows).catch(() => setRows([]));
  }

  useEffect(() => {
    reload();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await saveClient({
      data: {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        instagram: String(form.get("instagram") ?? ""),
        notes: String(form.get("notes") ?? ""),
      },
    });
    event.currentTarget.reset();
    setOpen(false);
    reload();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] tracking-[0.2em] text-ink-muted uppercase">Desk</p>
          <h1 className="mt-2 font-display text-4xl">Clients</h1>
        </div>
        <Button variant="invert" onClick={() => setOpen((v) => !v)}>
          {open ? "Cancel" : "Add client"}
        </Button>
      </div>

      {open ? (
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 border border-ink-border p-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" className="sm:col-span-2">
            <Input id="name" name="name" required />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" />
          </Field>
          <Field label="Instagram" htmlFor="instagram">
            <Input id="instagram" name="instagram" />
          </Field>
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" name="notes" className="min-h-24" />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" variant="invert">
              Save client
            </Button>
          </div>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <p className="mt-10 text-ink-muted">No clients yet. They appear when you book a session.</p>
      ) : (
        <ul className="mt-8 divide-y divide-ink-border border-y border-ink-border">
          {rows.map((client) => (
            <li key={client.id} className="py-4">
              <p className="font-medium">{client.name}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {[client.email, client.phone, client.instagram].filter(Boolean).join(" · ") ||
                  "No contact yet"}
              </p>
              {client.last_visit ? (
                <p className="mt-1 text-xs text-ink-subtle">
                  Last on the floor {formatWhen(client.last_visit)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
