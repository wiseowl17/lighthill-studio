import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { useI18n } from "@/lib/i18n/provider";

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
  const { copy } = useI18n();
  return (
    <main id="main" className="scheme-light bg-paper pb-24 text-ink">
      <div className="bg-bg text-fg">
        <PageHero
          eyebrow={copy.gallery.eyebrow}
          title={copy.gallery.title}
          lede={copy.gallery.lede}
        />
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8 md:pt-10">
        <MasonryGallery />
      </div>
    </main>
  );
}
