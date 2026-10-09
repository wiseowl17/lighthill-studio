import { Star } from "lucide-react";
import { ratings, reviews, type Review } from "@data/reviews";
import { cn } from "@/lib/utils";

type ReviewStripProps = {
  /** Which reviews to quote; they keep data/reviews.ts order. */
  pick?: (review: Review) => boolean;
  limit?: number;
  title?: string;
  className?: string;
};

/** Ratings from each listing plus a few verbatim quotes from data/reviews.ts. */
export function ReviewStrip({
  pick = () => true,
  limit = 3,
  title = "What people say",
  className,
}: ReviewStripProps) {
  const quotes = reviews.filter(pick).slice(0, limit);
  return (
    <div className={className}>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="font-display text-title">{title}</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {ratings.map((r) => (
            <a
              key={r.source}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
            >
              <span className="flex gap-0.5 text-ink" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-3.5 fill-current" strokeWidth={0} />
                ))}
              </span>
              <span>
                <span className="font-medium text-ink">{r.rating.toFixed(1)}</span> on {r.source} ·{" "}
                <span className="underline-offset-4 group-hover:underline">
                  {r.count} review{r.count === 1 ? "" : "s"}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "mt-10 grid gap-10 border-t border-ink-border pt-10",
          quotes.length > 1 && "md:grid-cols-3 md:gap-12",
        )}
      >
        {quotes.map((review) => (
          <figure key={review.quote} className="flex flex-col">
            <blockquote className="flex-1 font-display text-xl leading-snug md:text-2xl">
              “{review.quote}”
            </blockquote>
            <figcaption className="mt-4 text-sm text-ink-muted">
              <span className="text-ink">{review.author}</span>
              {review.role ? `, ${review.role}` : ""} · {review.source}
              {review.kind === "rental" ? " rental" : " session"}
              {review.note ? ` · ${review.note}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
