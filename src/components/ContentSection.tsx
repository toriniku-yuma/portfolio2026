import type { Content } from '../content/types';
import { labels, bodyFor } from '../content/data';
import { useDisplayContext } from '../state/context';
import MarkdownBody from './MarkdownBody';
import { renderLink, renderSkill } from './render';

export default function ContentSection({ item }: { item: Content }) {
  const { finishAnimation } = useDisplayContext();
  const contentType = labels[item.type];
  const Icon = contentType.icon;

  return (
    <article
      className="opacity-0 data-[seen=true]:opacity-100 motion-reduce:opacity-100 border-l border-solid border-accent pl-6 md:pl-8 py-2 min-w-0 relative data-[animated=true]:animate-section-enter"
      data-content-id={item.id}
      onAnimationEnd={finishAnimation}
      aria-labelledby={item.id}
    >
      <header className="min-w-0">
        <span
          className="font-mono text-[11px] text-accent bg-canvas absolute left-[-10px] top-0 py-1"
          aria-hidden="true"
        >
          {contentType.number}
        </span>
        <p className="font-mono text-accent text-[10px] tracking-[.17em] flex gap-2 items-center mb-3">
          <Icon size={14} aria-hidden="true" />
          {contentType.label}
        </p>
        <h2
          className="text-[25px] md:text-[32px] leading-[1.4] font-medium tracking-[-.03em] scroll-mt-[32px]"
          id={item.id}
          tabIndex={-1}
        >
          {item.title}
        </h2>
        {item.summary && <p className="text-muted text-sm mt-3">{item.summary}</p>}
      </header>
      <div className="min-w-0 mt-8">
        <MarkdownBody body={bodyFor(item)} />
        {item.skills && (
          <ul className="grid gap-6 mt-8">{item.skills.map(renderSkill)}</ul>
        )}
        {!!item.links?.length && (
          <ul className="flex flex-wrap gap-5 mt-6">{item.links.map(renderLink)}</ul>
        )}
      </div>
    </article>
  );
}
