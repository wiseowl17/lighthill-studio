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
import { useI18n } from "@/lib/i18n/provider";

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
  const { copy } = useI18n();
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow={copy.faq.eyebrow}
          title={copy.faq.title}
          lede={copy.faq.lede}
        />
      </div>
      <div className="mx-auto max-w-3xl px-5 pt-16 md:px-8">
        {faqGroups.map((group) => (
          <section key={group} className="mb-14">
            <h2 className="font-display text-title">{copy.faq.groups[group]}</h2>
            <Accordion type="single" collapsible className="mt-4">
              {faq
                .filter((item) => item.group === group)
                .map((item) => {
                  const text = copy.faq.items[item.id as keyof typeof copy.faq.items];
                  return (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>{text.q}</AccordionTrigger>
                      <AccordionContent>{text.a}</AccordionContent>
                    </AccordionItem>
                  );
                })}
            </Accordion>
          </section>
        ))}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="invert" size="lg" asChild>
            <Link to="/contact" search={{ type: "shoot" }}>
              {copy.faq.still}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
