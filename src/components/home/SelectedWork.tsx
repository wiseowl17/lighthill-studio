import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { galleryImages } from "@data/gallery";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";

const picks = galleryImages.filter((img) => img.featured);

export function SelectedWork() {
  return (
    <section className="bg-bg text-fg">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.2em] text-fg-muted uppercase">
              Selected work
            </p>
            <h2 className="mt-4 font-display text-headline">
              Quiet direction. Light that does the talking.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <Button variant="outline" size="lg" asChild>
              <Link to="/gallery">
                View the gallery
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </Reveal>
        </div>
        <div className="mt-14 columns-2 gap-2 sm:gap-3 lg:columns-3 lg:gap-4">
          {picks.map((img, i) => (
            <Reveal key={img.id} delay={i * 0.04} className="mb-2 break-inside-avoid sm:mb-3 lg:mb-4">
              <Link to="/gallery" className="group block overflow-hidden bg-bg-elevated">
                <img
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
