import type { ImgHTMLAttributes } from "react";

type PhotoProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

export function toWebp(src: string): string {
  return src.replace(/\.(jpe?g|png)$/i, ".webp");
}

export function Photo({
  src,
  alt = "",
  className,
  loading = "lazy",
  decoding = "async",
  ...rest
}: PhotoProps) {
  const webp = /\.(jpe?g|png)$/i.test(src) ? toWebp(src) : null;
  const img = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      {...rest}
    />
  );
  if (!webp) return img;
  return (
    <picture className="contents">
      <source type="image/webp" srcSet={webp} />
      {img}
    </picture>
  );
}
