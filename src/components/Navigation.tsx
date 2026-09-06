import { content } from '../content/data';
import { renderNavigation } from './render';

export default function Navigation() {
  return (
    <nav
      id="navigation"
      className="lg:sticky top-8 animate-page-enter [animation-delay:120ms]"
      aria-label="ポートフォリオのセクション"
    >
      <p className="font-mono text-[10px] tracking-[.16em] text-muted mb-5">
        INDEX / 目次
      </p>
      <ul className="flex flex-wrap gap-2 lg:block">{content.map(renderNavigation)}</ul>
    </nav>
  );
}
