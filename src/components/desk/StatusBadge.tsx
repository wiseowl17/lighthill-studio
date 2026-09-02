import { cn } from "@/lib/utils";
import type { BookingStatus, InvoiceStatus, PaymentStatus } from "@/lib/studio/catalog";

const tones: Record<string, string> = {
  confirmed: "bg-ink text-paper",
  tentative: "border border-ink/30 text-ink",
  completed: "bg-ink/10 text-ink",
  cancelled: "text-ink-subtle line-through",
  unpaid: "border border-ink/30 text-ink",
  deposit: "bg-ink/10 text-ink",
  paid: "bg-ink text-paper",
  refunded: "text-ink-muted",
  complimentary: "bg-ink/10 text-ink",
  draft: "border border-ink/30 text-ink",
  sent: "bg-ink/10 text-ink",
  void: "text-ink-subtle",
  new: "bg-ink text-paper",
  contacted: "bg-ink/10 text-ink",
  booked: "bg-ink text-paper",
  archived: "text-ink-subtle",
  shoot: "bg-ink text-paper",
  rental: "border border-ink text-ink",
  hold: "bg-paper-muted text-ink",
  blocked: "bg-ink/15 text-ink",
};

export function StatusBadge({
  value,
}: {
  value: BookingStatus | PaymentStatus | InvoiceStatus | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center px-2.5 text-[0.62rem] font-medium tracking-[0.14em] uppercase",
        tones[value] ?? "border border-ink/20 text-ink",
      )}
    >
      {value.replace("-", " ")}
    </span>
  );
}
