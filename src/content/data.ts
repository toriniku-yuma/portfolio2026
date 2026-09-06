import generated from '../generated/content.json';
import type { Content, ContentType } from './types';
import { UserRound, Route, CodeXml, Layers, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
const bodies = import.meta.glob<string>('../generated/bodies/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
export function bodyFor(item: Content) {
  return bodies['../generated/bodies/' + item.bodyFile];
}
export const content = generated as Content[];
export const ids = content.map((item) => item.id);
export const labels: Record<
  ContentType,
  { label: string; icon: LucideIcon; number: string }
> = {
  profile: { label: 'PROFILE', icon: UserRound, number: '01' },
  career: { label: 'EXPERIENCE', icon: Route, number: '02' },
  skills: { label: 'SKILLS', icon: CodeXml, number: '03' },
  project: { label: 'PROJECT', icon: Layers, number: '04' },
  about: { label: 'CONTACT', icon: Mail, number: '05' },
};
export const related = [
  ...new Map(
    content
      .flatMap((item) => item.links || [])
      .filter((link) => link.href.startsWith('https://'))
      .map((link) => [link.href, link]),
  ).values(),
];
