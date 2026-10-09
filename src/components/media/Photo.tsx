import type { ImgHTMLAttributes } from "react";

type PhotoProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

export function toWebp(src: string): string {
  return src.replace(/\.(jpe?g|png)$/i, ".webp");
}

/**
 * Width-described WebP candidates. `scripts/make-image-variants.mjs` writes the
 * -480/-800 files for everything under public/images; originals are ~1200px.
 */
export function webpSrcSet(src: string): string {
  const base = toWebp(src).replace(/\.webp$/i, "");
  return `${base}-480.webp 480w, ${base}-800.webp 800w, ${base}.webp 1200w`;
}

export function Photo({
  src,
  alt = "",
  className,
  loading = "lazy",
  decoding = "async",
  sizes,
  ...rest
}: PhotoProps) {
  const webp = /\.(jpe?g|png)$/i.test(src) ? toWebp(src) : null;
  // Only images under /images/ have resized variants; with no `sizes` hint the
  // browser would assume 100vw, so fall back to the single full-size file.
  const responsive = webp && sizes && src.startsWith("/images/");
  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      sizes={sizes}
      {...rest}
    />
  );
  if (!webp) return img;
  return (
    <picture className="contents">
      <source
        type="image/webp"
        srcSet={responsive ? webpSrcSet(src) : webp}
        sizes={responsive ? sizes : undefined}
      />
      {img}
    </picture>
  );
}
