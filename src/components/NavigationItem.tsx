import AppLink from './AppLink';
import type { Content } from '../content/types';
import { labels } from '../content/data';
import { useDisplayContext } from '../state/context';

export default function NavigationItem({ item }: { item: Content }) {
  const { selected } = useDisplayContext();
  const Icon = labels[item.type].icon;

  return (
    <li>
      <AppLink
        underline
        className="flex gap-3 items-center py-3 pr-3 text-[13px] text-muted aria-[current=location]:text-accent aria-[current=location]:hover:text-accent hover:text-ink"
        href={'#' + item.id}
        aria-current={selected === item.id ? 'location' : undefined}
      >
        <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
        {item.title}
      </AppLink>
    </li>
  );
}
