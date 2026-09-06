import type { ComponentPropsWithoutRef } from 'react';

export default function MarkdownTable({ children }: ComponentPropsWithoutRef<'table'>) {
  return (
    <div
      className="overflow-x-auto max-w-full"
      tabIndex={0}
      role="region"
      aria-label="表（横スクロールできます）"
    >
      <table>{children}</table>
    </div>
  );
}
