import type { ComponentPropsWithoutRef } from 'react';

export default function MarkdownCode({ children }: ComponentPropsWithoutRef<'pre'>) {
  return (
    <pre
      className="overflow-x-auto max-w-full"
      tabIndex={0}
      aria-label="コード（横スクロールできます）"
    >
      {children}
    </pre>
  );
}
