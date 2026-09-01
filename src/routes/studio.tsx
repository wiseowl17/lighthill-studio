import { createFileRoute } from "@tanstack/react-router";
import { amenities, studioFeatures, studioIntro } from "@data/studio";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CtaPair } from "@/components/layout/CtaPair";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
  head: () => ({
    meta: [
      { title: "The Studio — Lighthill" },
      {
        name: "description",
        content:
          "A 1,200 sq ft photography studio in Lawrenceville, GA with a white cyclorama, Godox lighting, a podcast set, and a private changing room.",
      },
    ],
  }),
});

function StudioPage() {
  return (
    <main id="main" className="bg-bg pb-0 text-fg">
      <PageHero
        eyebrow="The studio"
        title={studioIntro.title}
        lede={studioIntro.body}
        image="/images/cyclorama.jpg"
        imageAlt="Lighthill Studio white cyclorama"
      />

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-16">
            {studioFeatures.map((feature, i) => (
              <article
                key={feature.id}
                className="grid items-center gap-8 md:grid-cols-12 md:gap-12"
              >
                <Reveal
                  className={
                    i % 2 === 1
                      ? "md:col-span-7 md:col-start-6"
                      : "md:col-span-7"
                  }
                >
                  <div className="aspect-photo overflow-hidden bg-paper-muted">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover"
                      style={{
                        objectPosition: feature.objectPosition ?? "center",
                      }}
                    />
                  </div>
                </Reveal>
                <Reveal
                  delay={0.08}
                  className={
                    i % 2 === 1
                      ? "md:col-span-4 md:col-start-1 md:row-start-1"
                      : "md:col-span-4 md:col-start-9"
                  }
                >
                  <p className="text-[0.68rem] tracking-[0.18em] text-ink-muted uppercase">
                    0{i + 1}
                  </p>
                  <h2 className="mt-3 font-display text-title">{feature.title}</h2>
                  <p className="mt-4 leading-relaxed text-ink-muted">
                    {feature.description}
                  </p>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg text-fg">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <p className="text-[0.7rem] tracking-[0.2em] text-fg-muted uppercase">
              Amenities
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-headline">
              Built for working creatives, not for Instagram alone.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {amenities.map((item) => (
              <div key={item.id} className="flex h-full flex-col bg-bg p-6 md:p-8">
                <h3 className="font-display text-xl">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <CtaPair className="mt-14" />
        </div>
      </section>
    </main>
  );
}
