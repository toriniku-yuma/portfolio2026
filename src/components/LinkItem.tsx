import AppLink from './AppLink';
import type { ContentLink } from '../content/types';
import { ArrowUpRight } from 'lucide-react';

export default function LinkItem({ link }: { link: ContentLink }) {
  return (
    <li>
      <AppLink
        className="inline-flex gap-2 items-center text-accent text-sm underline-offset-[5px]"
        href={link.href}
      >
        {link.label}
        <ArrowUpRight size={16} aria-hidden="true" />
      </AppLink>
    </li>
  );
}
