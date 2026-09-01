import { createFileRoute, Link } from "@tanstack/react-router";
import { faq, faqGroups } from "@data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Lighthill Studio" },
      {
        name: "description",
        content:
          "Cancellation policies, studio rules, and what to expect at an in-house Lighthill session.",
      },
    ],
  }),
});

function FaqPage() {
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="FAQ"
          title="What to know before you step on the floor."
          lede="Sessions, rentals, and the house rules we keep so the cyclorama stays white."
        />
      </div>
      <div className="mx-auto max-w-3xl px-5 pt-16 md:px-8">
        {faqGroups.map((group) => (
          <section key={group} className="mb-14">
            <h2 className="font-display text-title">{group}</h2>
            <Accordion type="single" collapsible className="mt-4">
              {faq
                .filter((item) => item.group === group)
                .map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </section>
        ))}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="invert" size="lg" asChild>
            <Link to="/contact" search={{ type: "shoot" }}>
              Still have a question
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
