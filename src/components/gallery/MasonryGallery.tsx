import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  galleryCategories,
  galleryImages,
  type GalleryCategory,
  type GalleryImage,
} from "@data/gallery";
import { cn } from "@/lib/utils";

export function MasonryGallery() {
  const [filter, setFilter] = useState<GalleryCategory>("All");
  const [active, setActive] = useState<GalleryImage | null>(null);
  const reduce = useReducedMotion();

  const items = useMemo(
    () =>
      filter === "All"
        ? galleryImages
        : galleryImages.filter((img) => img.category === filter),
    [filter],
  );

  const openIndex = active
    ? items.findIndex((img) => img.id === active.id)
    : -1;

  function show(delta: number) {
    if (openIndex < 0) return;
    const next = (openIndex + delta + items.length) % items.length;
    const img = items[next];
    if (img) setActive(img);
  }

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") show(-1);
      if (event.key === "ArrowRight") show(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, openIndex, items]);

  return (
    <div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {galleryCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "h-11 shrink-0 px-4 text-xs font-medium tracking-[0.16em] uppercase transition-colors duration-150",
              filter === cat
                ? "bg-ink text-paper"
                : "bg-transparent text-ink-muted hover:text-ink",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((img, i) => (
          <motion.button
            key={img.id}
            type="button"
            layout={!reduce}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04 }}
            onClick={() => setActive(img)}
            className="mb-4 block w-full break-inside-avoid overflow-hidden bg-paper-muted text-left"
          >
            <img
              src={img.src}
              alt={img.alt}
              className={cn(
                "w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03]",
                img.span === "tall"
                  ? "aspect-portrait"
                  : img.span === "square"
                    ? "aspect-square"
                    : "aspect-photo",
              )}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg/92 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.alt}
          >
            <button
              type="button"
              className="absolute top-4 right-4 flex size-11 items-center justify-center text-fg"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <X className="size-6" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              className="absolute top-1/2 left-2 flex size-11 -translate-y-1/2 items-center justify-center text-fg md:left-6"
              onClick={(e) => {
                e.stopPropagation();
                show(-1);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-8" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 items-center justify-center text-fg md:right-6"
              onClick={(e) => {
                e.stopPropagation();
                show(1);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="size-8" strokeWidth={1.25} />
            </button>
            <motion.img
              key={active.id}
              src={active.src}
              alt={active.alt}
              initial={reduce ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[82dvh] max-w-[min(92vw,1100px)] object-contain outline-none"
            />
            <p className="absolute bottom-5 left-1/2 max-w-lg -translate-x-1/2 px-4 text-center text-xs tracking-wide text-fg-muted">
              {active.alt}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
