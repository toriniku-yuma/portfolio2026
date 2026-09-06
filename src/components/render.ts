import { createElement } from 'react';
import type { Content, ContentLink } from '../content/types';
import ContentSection from './ContentSection';
import NavigationItem from './NavigationItem';
import LinkItem from './LinkItem';
import SkillBar from './SkillBar';
import type { Skill } from '../content/types';
export function renderSkill(skill: Skill) { return createElement(SkillBar, { key: skill.name, skill }); }
export function renderSection(item: Content) { return createElement(ContentSection, { key: item.id, item }); }
export function renderNavigation(item: Content) { return createElement(NavigationItem, { key: item.id, item }); }
export function renderLink(link: ContentLink) { return createElement(LinkItem, { key: link.href + link.label, link }); }
