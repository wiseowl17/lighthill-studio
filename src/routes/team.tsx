import { createFileRoute, Link } from "@tanstack/react-router";
import { team, teamIntro } from "@data/team";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { InstagramLink } from "@/components/layout/ContactLinks";
import { Photo } from "@/components/media/Photo";

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
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow={teamIntro.eyebrow}
          title={teamIntro.title}
          lede={teamIntro.body}
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
              <p className="mt-5 text-[0.68rem] tracking-[0.16em] text-ink-muted uppercase">
                {member.title}
              </p>
              <h2 className="mt-2 font-display text-4xl">{member.name}</h2>
              <p className="mt-4 max-w-lg flex-1 leading-relaxed text-ink-muted">
                {member.bio}
              </p>
              {member.instagram ? (
                <InstagramLink className="mt-4 text-ink hover:opacity-70" />
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
