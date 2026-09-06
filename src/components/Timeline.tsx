import { content } from '../content/data';
import { renderSection } from './render';

export default function Timeline() {
  return <div className="grid gap-16">{content.map(renderSection)}</div>;
}
