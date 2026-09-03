import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { site } from "@data/site";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rent")({
  component: RentPage,
  head: () => ({
    meta: [
      { title: "Rent the studio — Lighthill Studio" },
      {
        name: "description",
        content: "Book the Lighthill cyclorama. 50% deposit through Stripe.",
      },
    ],
  }),
});

function RentPage() {
  return (
    <main id="main" className="bg-paper text-ink">
      <PageHero
        eyebrow="Studio rental"
        title="Rent the cyclorama."
        lede="Stripe keys go in Desk → Settings. Instant-book checkout with a 50% deposit is next — Peerspace still works in the meantime."
      />
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8">
        <div className="flex flex-wrap gap-3">
          <Button variant="invert" size="lg" asChild>
            <a href={site.peerspaceUrl} target="_blank" rel="noopener noreferrer">
              Book with Peerspace
              <ArrowUpRight className="size-3.5" />
            </a>
          </Button>
          <Button variant="paperOutline" size="lg" asChild>
            <Link to="/contact" search={{ type: "rental" }}>
              Write the studio
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
