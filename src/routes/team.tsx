import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { team } from "@data/team";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { Photo } from "@/components/media/Photo";
import { useI18n } from "@/lib/i18n/provider";

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({
    meta: [
      { title: "Team — Lighthill Studio" },
      {
        name: "description",
        content:
          "Meet Luz Reyes and Hillary Urgelles, co-owners of Lighthill Studio in Lawrenceville, Georgia.",
      },
    ],
  }),
});

function TeamPage() {
  const { copy } = useI18n();
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow={copy.team.eyebrow}
          title={copy.team.title}
          lede={copy.team.body}
        />
      </div>
      <div className="mx-auto grid max-w-7xl items-stretch gap-10 px-5 pt-16 md:grid-cols-2 md:px-8">
        {team.map((member, i) => (
          <Reveal key={member.id} delay={i * 0.06} className="h-full">
            <article className="flex h-full flex-col">
              <div className="aspect-portrait overflow-hidden bg-paper-muted">
                <Photo
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: member.objectPosition ?? "center 18%",
                  }}
                />
              </div>
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-11 w-fit items-center gap-2.5 border border-ink px-4 text-[0.72rem] font-medium tracking-[0.16em] text-ink uppercase transition-colors duration-150 hover:bg-ink hover:text-paper"
              >
                <Instagram className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                {member.instagramHandle}
              </a>
              <p className="mt-5 text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                {copy.team.coOwner}
              </p>
              <h2 className="mt-2 font-display text-4xl">{member.name}</h2>
              <p className="mt-4 max-w-lg flex-1 leading-relaxed text-ink-muted">
                {member.id === "luz" ? copy.team.luz : copy.team.hillary}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-16 md:px-8">
        <Button variant="invert" size="lg" asChild>
          <Link to="/contact" search={{ type: "shoot" }}>
            {copy.team.workWithUs}
          </Link>
        </Button>
      </div>
    </main>
  );
}
