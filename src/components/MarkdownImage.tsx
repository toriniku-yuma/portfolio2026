import type { ComponentPropsWithoutRef } from 'react';

export default function MarkdownImage({
  src,
  alt,
  title,
}: ComponentPropsWithoutRef<'img'>) {
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      loading="lazy"
      decoding="async"
      width="1200"
      height="675"
    />
  );
}
