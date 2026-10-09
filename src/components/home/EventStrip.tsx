import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cocoween, cocoweenIsOn } from "@data/cocoween";
import { money } from "@/lib/studio/catalog";
import { todayInTz } from "@/lib/studio/time";

/**
 * One slim line under the hero while an event is on sale. No photo: the
 * owners rejected a big homepage banner, and this hides itself after the day.
 */
export function EventStrip() {
  if (!cocoweenIsOn(todayInTz())) return null;
  return (
    <Link
      to="/event"
      className="group block border-y border-[#f2a11f]/40 bg-[#1c0f2e] text-[#f6efff]"
    >
      <span className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm md:px-8">
        <span className="font-medium text-[#f2a11f]">Cocoween</span>
        <span>Halloween &amp; Día de los Muertos for kids</span>
        <span className="text-[#cdbfe2]">
          Sat, Oct 31 · 1–4 PM · {money(cocoween.priceCents).replace(".00", "")} per child
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 underline-offset-4 group-hover:underline">
          Get tickets
          <ArrowRight className="size-3.5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
