import { useEffect, useState, type FormEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { site } from "@data/site";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export type InquiryType = "shoot" | "rental";

const TYPE_LABEL: Record<InquiryType, string> = {
  shoot: "In-House Shoot",
  rental: "Studio Rental Inquiry",
};

type ContactFormProps = {
  defaultType?: InquiryType;
};

export function ContactForm({ defaultType = "shoot" }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [type, setType] = useState<InquiryType>(defaultType);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      projectType: TYPE_LABEL[type],
      message: String(data.get("message") ?? ""),
      _subject: `Lighthill Studio — ${TYPE_LABEL[type]}`,
    };

    setStatus("sending");
    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(site.contactEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("FormSubmit rejected the request");
      setStatus("sent");
      form.reset();
      setType(defaultType);
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
        <h3 className="font-display text-3xl text-ink">Message received.</h3>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          Thank you. We read every note and will reply within one business day
          with next steps — dates, a brief, or a Peerspace link if you are
          renting the floor.
        </p>
        <Button
          type="button"
          variant="paperOutline"
          onClick={() => setStatus("idle")}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="projectType">Project type</Label>
        <div className="relative">
          <select
            id="projectType"
            name="projectType"
            value={type}
            onChange={(e) => setType(e.target.value as InquiryType)}
            className="h-12 w-full appearance-none rounded-md border border-ink-border bg-paper px-3.5 pr-10 font-sans text-sm text-ink outline-none focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-ink/15"
          >
            <option value="shoot">In-House Shoot</option>
            <option value="rental">Studio Rental Inquiry</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            strokeWidth={1.5}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Tell us the date, the kind of session, and anything we should know."
        />
      </div>
      {status === "error" ? (
        <p className="text-sm text-ink-muted">
          Something went sideways. Email us directly at {site.contactEmail}, or
          try again in a moment.
        </p>
      ) : null}
      <Button
        type="submit"
        variant="invert"
        size="lg"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
