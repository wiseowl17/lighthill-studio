import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { galleryImages, selectedWork } from "@data/gallery";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { Photo } from "@/components/media/Photo";
import { useI18n } from "@/lib/i18n/provider";

// Uniform 3:4 crops: mixed portrait/square/landscape files in CSS columns left
// every column a different height. Unknown ids are skipped, never rendered blank.
const picks = selectedWork.flatMap(({ id, focus }) => {
  const img = galleryImages.find((g) => g.id === id);
  return img ? [{ ...img, focus }] : [];
});

export function SelectedWork() {
  const { copy } = useI18n();
  return (
    <section className="bg-bg text-fg">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] text-fg-muted uppercase">
              {copy.home.selectedEyebrow}
            </p>
            <h2 className="mt-4 font-display text-headline">{copy.home.selectedTitle}</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Button variant="outline" size="lg" asChild>
              <Link to="/gallery">
                {copy.home.viewGallery}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </Reveal>
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:gap-4">
          {picks.map((img, i) => (
            <li key={img.id}>
              <Reveal delay={(i % 4) * 0.05}>
                <Link
                  to="/gallery"
                  className="group block aspect-portrait overflow-hidden bg-bg-elevated"
                >
                  <Photo
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    style={img.focus ? { objectPosition: img.focus } : undefined}
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
