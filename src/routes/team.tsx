import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { team, teamIntro } from "@data/team";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";

export const Route = createFileRoute("/team")({
  component: TeamPage,
  head: () => ({
    meta: [
      { title: "Team — Lighthill Studio" },
      {
        name: "description",
        content:
          "Meet the photographers behind Lighthill Studio in Lawrenceville, Georgia.",
      },
    ],
  }),
});

function TeamPage() {
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow={teamIntro.eyebrow}
          title={teamIntro.title}
          lede={teamIntro.body}
        />
      </div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-16 md:grid-cols-2 md:px-8">
        {team.map((member, i) => (
          <Reveal key={member.id} delay={i * 0.06}>
            <article>
              <div className="aspect-portrait overflow-hidden bg-paper-muted">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-5 text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                {member.title}
              </p>
              <h2 className="mt-2 font-display text-4xl">{member.name}</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-ink-muted">
                {member.bio}
              </p>
              {member.instagram ? (
                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-ink transition-opacity hover:opacity-70"
                >
                  Instagram
                  <ArrowUpRight className="size-3.5" />
                </a>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-16 md:px-8">
        <Button variant="invert" size="lg" asChild>
          <Link to="/contact" search={{ type: "shoot" }}>
            Work with us
          </Link>
        </Button>
      </div>
    </main>
  );
}
