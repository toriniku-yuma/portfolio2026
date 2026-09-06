export type ContentType = 'profile' | 'career' | 'skills' | 'project' | 'about';
export interface ContentLink {
  label: string;
  href: string;
}
export interface Content {
  id: string;
  type: ContentType;
  order: number;
  title: string;
  summary?: string;
  links?: ContentLink[];
  bodyFile: string;
  skills?: Skill[];
}
export interface Skill {
  name: string;
  level: number;
}
