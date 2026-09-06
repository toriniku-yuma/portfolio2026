import { parseDocument } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';

const parser = unified().use(remarkParse).use(remarkGfm);
const reserved = new Set(['main', 'top', 'navigation', 'related-links', 'card-designs', 'design-heading']);
const types = new Set(['profile', 'career', 'skills', 'project', 'about']);
const control = /[\u0000-\u0020\u007f-\u009f\\]/;
const fields = new Set(['id', 'type', 'order', 'title', 'mock', 'summary', 'links', 'skills']);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function linkUrl(href, ids) {
  if (!nonempty(href) || control.test(href)) throw new Error('URL: 空白・制御文字・バックスラッシュは禁止');
  let decoded;
  try { decoded = decodeURIComponent(href); } catch { throw new Error('URL: 不正なパーセント符号化'); }
  if (/[\u0000-\u001f\u007f-\u009f\\]/.test(decoded)) throw new Error('URL: エンコードされた制御文字等は禁止');
  if (href.startsWith('#')) {
    if (!ids.has(decoded.slice(1))) throw new Error('URL: 内部アンカーの参照先が存在しません');
    return;
  }
  let url;
  try { url = new URL(href); } catch { throw new Error('URL: 絶対HTTPS URL、mailto、#idのみ許可'); }
  if (href.startsWith('https://') && url.protocol === 'https:' && url.hostname && !url.username && !url.password) return;
  if (href.startsWith('mailto:') && url.protocol === 'mailto:' && /^[^\s@/?#]+@[^\s@/?#]+$/.test(url.pathname)) return;
  throw new Error('URL: 許可外のURLまたはユーザー情報');
}

function imageUrl(href, alt, imagesDirectory) {
  if (!nonempty(alt)) throw new Error('image: 代替テキストが必要');
  let path;
  try { path = decodeURIComponent(href); } catch { throw new Error('image: 不正なパーセント符号化'); }
  if (!href.startsWith('/images/') || control.test(href) || /[\u0000-\u001f\u007f-\u009f\\?#]/.test(path) || path.split('/').some(part => part === '..' || part === '.')) throw new Error('image: public/images内の論理パスのみ許可');
  const root = resolve(imagesDirectory);
  const file = resolve(root, path.slice('/images/'.length));
  const rel = relative(root, file);
  if (rel.startsWith('..') || isAbsolute(rel) || !existsSync(file) || !statSync(file).isFile()) throw new Error('image: ファイルが存在しません');
  const real = relative(realpathSync(root), realpathSync(file));
  if (real.startsWith('..') || isAbsolute(real)) throw new Error('image: images外への参照は禁止');
}

export function compileContent(sources, { release = false, imagesDirectory = 'public/images' } = {}) {
  if (!sources.length) throw new Error('content/: 原稿が0件です');
  const records = sources.map(({ name, text }) => {
    try {
      const match = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
      if (!match) throw new Error('frontmatter: YAML区切りが必要');
      const doc = parseDocument(match[1], { uniqueKeys: true });
      if (doc.errors.length) throw new Error('YAML: ' + doc.errors[0].message);
      const data = doc.toJS({ maxAliasCount: 50 });
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('frontmatter: オブジェクトが必要');
      for (const key of Object.keys(data)) if (!fields.has(key)) throw new Error(key + ': 未知の項目');
      if (!nonempty(data.id) || !/^[a-z][a-z0-9-]*$/.test(data.id) || reserved.has(data.id)) throw new Error('id: 不正または予約済み');
      if (!types.has(data.type)) throw new Error('type: 未知または欠落');
      if (!Number.isSafeInteger(data.order)) throw new Error('order: 安全な整数が必要');
      if (!nonempty(data.title)) throw new Error('title: 空でない文字列が必要');
      if (typeof data.mock !== 'boolean') throw new Error('mock: booleanが必要');
      if ('summary' in data && !nonempty(data.summary)) throw new Error('summary: 空でない文字列が必要');
      if ('skills' in data && (data.type !== 'skills' || !Array.isArray(data.skills) || data.skills.some(skill => !skill || typeof skill !== 'object' || Object.keys(skill).some(key => !['name', 'level'].includes(key)) || !nonempty(skill.name) || !Number.isFinite(skill.level) || skill.level < 0 || skill.level > 100) || new Set(data.skills.map(skill => skill.name)).size !== data.skills.length)) throw new Error('skills: 重複のないnameと0〜100のlevelが必要（skills型のみ）');
      if ('links' in data && (!Array.isArray(data.links) || data.links.some(link => !link || typeof link !== 'object' || Array.isArray(link) || Object.keys(link).some(key => !['label', 'href'].includes(key)) || !nonempty(link.label) || !nonempty(link.href)))) throw new Error('links: label/hrefだけを持つ配列が必要');
      if (!match[2].trim()) throw new Error('body: 空本文は禁止');
      if (release && data.mock) throw new Error('mock: 公開用ビルドではモックを拒否');
      return { name, content: { ...data, body: match[2].trim() } };
    } catch (error) { throw new Error(name + ': ' + error.message, { cause: error }); }
  });
  const ids = new Set();
  for (const { name, content } of records) {
    if (ids.has(content.id)) throw new Error(name + ': id: 重複 ' + content.id);
    ids.add(content.id);
  }
  for (const { name, content } of records) {
    try {
      for (const link of content.links || []) linkUrl(link.href, ids);
      const tree = parser.parse(content.body);
      const definitions = new Map();
      visit(tree, 'definition', node => {
        // Validate every definition, including unused definitions.
        if (node.url.startsWith('/images/')) imageUrl(node.url, 'definition', imagesDirectory);
        else linkUrl(node.url, ids);
        definitions.set(node.identifier.toUpperCase(), node);
      });
      visit(tree, node => {
        if (node.type === 'html') throw new Error('body: 生HTMLは禁止');
        if (node.type === 'heading' && node.depth < 3) throw new Error('body: 小見出しはh3以上');
        if (node.type === 'link') linkUrl(node.url, ids);
        if (node.type === 'image') imageUrl(node.url, node.alt, imagesDirectory);
        if (node.type === 'linkReference' || node.type === 'imageReference') {
          const definition = definitions.get(node.identifier.toUpperCase());
          if (!definition) throw new Error('body: 参照定義が存在しません');
          if (node.type === 'imageReference') imageUrl(definition.url, node.alt, imagesDirectory);
          else linkUrl(definition.url, ids);
        }
      });
    } catch (error) { throw new Error(name + ': ' + error.message, { cause: error }); }
  }
  return records.map(record => record.content).sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
