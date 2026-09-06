import { createElement } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { ExtraProps } from 'react-markdown';
import AppLink from '../components/AppLink';
import { defaultUrlTransform } from 'react-markdown';
import MarkdownTable from '../components/MarkdownTable';
import MarkdownCode from '../components/MarkdownCode';
import MarkdownImage from '../components/MarkdownImage';
function markdownLink(props: ComponentPropsWithoutRef<'a'> & ExtraProps) {
  const { node, ...link } = props;
  void node;
  return createElement(AppLink, link);
}
export const markdownComponents = {
  a: markdownLink,
  table: MarkdownTable,
  pre: MarkdownCode,
  img: MarkdownImage,
};
export function transformUrl(url: string) {
  if (url.startsWith('/images/')) return import.meta.env.BASE_URL + url.slice(1);
  return defaultUrlTransform(url);
}
