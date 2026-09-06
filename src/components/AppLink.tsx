import type { ComponentPropsWithoutRef } from 'react';

export default function AppLink({
  className = '',
  children,
  underline = false,
  ...props
}: ComponentPropsWithoutRef<'a'> & { underline?: boolean }) {
  return (
    <a
      data-app-link
      {...props}
      className={`${underline ? 'navigation-link-motion' : 'transition-opacity duration-400 ease-in-out hover:opacity-80 focus-visible:opacity-80'} ${className}`}
    >
      {children}
    </a>
  );
}
