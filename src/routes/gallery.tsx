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
          "Selected photography from Lighthill Studio — portraits, maternity, branding, fashion, and the room itself.",
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
          lede="A selection of in-house sessions and wide frames of the studio. Tap any image to open it."
        />
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-10">
        <MasonryGallery />
      </div>
    </main>
  );
}
