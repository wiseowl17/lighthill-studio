import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The homepage's fork: two different buyers (people booking a session, and
 * creatives renting the room) each get one clear door right after the hero.
 */
export function TwoPaths() {
  return (
    <section className="bg-paper text-ink">
      <div className="mx-auto grid max-w-7xl gap-4 px-5 py-16 md:grid-cols-2 md:gap-6 md:px-8 md:py-24">
        <Reveal className="h-full">
          <Door
            image="/images/maternity.jpg"
            imagePosition="center 30%"
            eyebrow="In-house photography"
            title="Book a session with us."
            body="Maternity, newborn, family, cake smash, branding, headshots and podcasts, directed and lit by co-owners Luz and Hillary."
            facts={["Planned with you before the shoot", "Our studio, our lights, our team"]}
            cta={{ label: "Book a Shoot", to: "/contact", search: { type: "shoot" } }}
          />
        </Reveal>
        <Reveal delay={0.06} className="h-full">
          <Door
            image="/images/infinity-wall-studio.jpg"
            imagePosition="center 70%"
            eyebrow="Studio rental"
            title="Rent the infinity wall."
            body="A 1,200 sq ft studio built around a white infinity wall that curves into the floor, so your shots have no corners and no horizon line."
            facts={[
              "$55 an hour · 2-hour minimum",
              "Many Atlanta infinity wall studios list at $60–$150",
              "Open 24 hours · book online instantly",
            ]}
            cta={{ label: "Rent Studio", to: "/rent" }}
          />
        </Reveal>
      </div>
    </section>
  );
}

function Door({
  image,
  imagePosition,
  eyebrow,
  title,
  body,
  facts,
  cta,
}: {
  image: string;
  imagePosition: string;
  eyebrow: string;
  title: string;
  body: string;
  facts: string[];
  cta: { label: string; to: "/contact" | "/rent"; search?: { type: "shoot" } };
}) {
  return (
    <article className="flex h-full flex-col border border-ink-border bg-paper">
      <div className="aspect-photo overflow-hidden bg-paper-muted">
        <Photo
          src={image}
          alt=""
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover"
          style={{ objectPosition: imagePosition }}
        />
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-8">
        <p className="text-xs font-medium tracking-[0.2em] text-ink-muted uppercase">{eyebrow}</p>
        <h2 className="mt-3 font-display text-title">{title}</h2>
        <p className="mt-4 leading-relaxed text-ink-muted">{body}</p>
        <ul className="mt-5 flex-1 space-y-1.5 text-sm text-ink">
          {facts.map((fact) => (
            <li key={fact} className="flex gap-2">
              <span aria-hidden className="text-ink-subtle">
                —
              </span>
              {fact}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button variant="invert" size="lg" asChild>
            <Link to={cta.to} search={cta.search}>
              {cta.label}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
