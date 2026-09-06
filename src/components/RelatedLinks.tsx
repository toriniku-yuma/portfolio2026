import { related } from '../content/data';
import { renderLink } from './render';

export default function RelatedLinks() {
  return (
    <aside
      id="related-links"
      className="hidden xl:block sticky top-8 text-sm text-muted [&_p_+_p]:mt-5"
      aria-label="関連リンク"
    >
      <p className="font-mono text-[10px] tracking-[.16em] text-muted mb-5">ELSEWHERE</p>
      <ul>{related.map(renderLink)}</ul>
      <p>
        経歴、スキル、制作物。
        <br />
        ものづくりの足跡。
      </p>
    </aside>
  );
}
