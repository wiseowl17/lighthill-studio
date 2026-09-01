import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";

export const Route = createFileRoute("/gallery")({
  component: GalleryPage,
  head: () => ({
    meta: [
      { title: "Gallery — Lighthill Studio" },
      {
        name: "description",
        content:
          "Selected photography from Lighthill Studio — maternity, newborn, branding, headshots, family, seasonals, celebrations, podcasts, and the room itself.",
      },
    ],
  }),
});

function GalleryPage() {
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow="Gallery"
          title="The work, and the room it was made in."
          lede="Sessions made here — maternity, newborns, families, brands, headshots, seasonals, celebrations. Tap any frame."
        />
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-10">
        <MasonryGallery />
      </div>
    </main>
  );
}
