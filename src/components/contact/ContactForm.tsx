import { useEffect, useState, type FormEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { site } from "@data/site";
import { services } from "@data/services";
import { todayInTz } from "@/lib/studio/time";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { submitInquiry } from "@/lib/studio/fns";
import { useI18n } from "@/lib/i18n/provider";

export type InquiryType = "shoot" | "rental";

type ContactFormProps = {
  defaultType?: InquiryType;
  /** data/services.ts id carried from the homepage card the visitor tapped. */
  defaultService?: string;
};

export function ContactForm({ defaultType = "shoot", defaultService }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [type, setType] = useState<InquiryType>(defaultType);
  const [service, setService] = useState(defaultService ?? "");
  const { copy } = useI18n();

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    setService(defaultService ?? "");
  }, [defaultService]);

  const serviceTitle = (id: string) =>
    copy.services[id as keyof typeof copy.services]?.title ??
    services.find((s) => s.id === id)?.title ??
    id;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const kindLabel = type === "shoot" ? copy.contact.shoot : copy.contact.rental;
    const session = type === "shoot" && service ? serviceTitle(service) : "";
    const idealDate = String(data.get("idealDate") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    // The desk inbox stores one message field, so the session and date ride
    // at the top of it as well as going to FormSubmit as their own fields.
    const header = [
      session ? `Session: ${session}` : "",
      idealDate ? `Ideal date: ${idealDate}` : "",
    ].filter(Boolean);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      projectType: kindLabel,
      ...(session ? { session } : {}),
      ...(idealDate ? { idealDate } : {}),
      message,
      _subject: `Lighthill Studio — ${session ? `${session} session` : kindLabel}`,
    };

    setStatus("sending");
    const inquiry = {
      name: payload.name.trim(),
      email: payload.email.trim(),
      phone: payload.phone.trim() || undefined,
      kind: type,
      message: header.length ? `${header.join("\n")}\n\n${message}` : message,
    };
    try {
      const [mail, desk] = await Promise.allSettled([
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(site.contactEmail)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }),
        submitInquiry({ data: inquiry }),
      ]);
      const mailOk = mail.status === "fulfilled" && mail.value.ok;
      const deskOk = desk.status === "fulfilled" && desk.value.ok;
      if (!mailOk && !deskOk) throw new Error("Could not send");
      setStatus("sent");
      form.reset();
      setType(defaultType);
      setService(defaultService ?? "");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-4 border border-ink-border bg-paper p-8">
        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-paper">
          <Check className="size-5" strokeWidth={1.5} />
        </span>
        <h3 className="font-display text-3xl text-ink">{copy.contact.received}</h3>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">{copy.contact.thanks}</p>
        <Button type="button" variant="paperOutline" onClick={() => setStatus("idle")}>
          {copy.contact.another}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">{copy.contact.name}</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">{copy.contact.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">{copy.contact.phone} (optional)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="projectType">{copy.contact.projectType}</Label>
        <div className="relative">
          <select
            id="projectType"
            name="projectType"
            value={type}
            onChange={(e) => setType(e.target.value as InquiryType)}
            className="h-12 w-full appearance-none rounded-md border border-ink-border bg-paper px-3.5 pr-10 font-sans text-sm text-ink outline-none focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15"
          >
            <option value="shoot">{copy.contact.shoot}</option>
            <option value="rental">{copy.contact.rental}</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.5}
          />
        </div>
      </div>
      {type === "shoot" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="session">Session</Label>
            <div className="relative">
              <select
                id="session"
                name="session"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="h-12 w-full appearance-none rounded-md border border-ink-border bg-paper px-3.5 pr-10 font-sans text-sm text-ink outline-none focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15"
              >
                <option value="">Not sure yet</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {serviceTitle(s.id)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="idealDate">Ideal date (optional)</Label>
            <Input id="idealDate" name="idealDate" type="date" min={todayInTz()} />
          </div>
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="message">{copy.contact.message}</Label>
        <Textarea id="message" name="message" required placeholder={copy.contact.placeholder} />
      </div>
      {status === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {copy.contact.error}{" "}
          <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-4">
            {site.contactEmail}
          </a>
        </p>
      ) : null}
      <Button type="submit" variant="invert" size="lg" disabled={status === "sending"}>
        {status === "sending" ? copy.contact.sending : copy.contact.send}
      </Button>
    </form>
  );
}
