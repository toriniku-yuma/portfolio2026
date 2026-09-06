import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileContent } from '../scripts/content.mjs';

const sample = (extra = '', body = '本文です。', id = 'sample', type = 'profile') => ({ name: id + '.md', text: '---\nid: ' + id + '\ntype: ' + type + '\norder: 1\ntitle: サンプル\n' + extra + '\n---\n' + body });
test('C01/C03 全type、任意項目、本文保持、同orderのASCII整列', () => {
  const records = ['profile', 'career', 'skills', 'project', 'about'].map(type => sample('summary: 概要\nlinks: []', '### 小見出し\n本文', type, type));
  const result = compileContent(records);
  assert.deepEqual(result.map(item => item.id), ['about', 'career', 'profile', 'project', 'skills']);
  assert.equal(result[0].body, '### 小見出し\n本文');
  assert.equal(compileContent([sample()]).length, 1);
});
test('C02 必須・型・未知項目・重複キーを拒否', () => {
  for (const [from, to] of [
    ['id: sample', ''], ['type: profile', 'type: contact'], ['order: 1', 'order: 1.5'],
    ['order: 1', 'order: 9007199254740992'], ['title: サンプル', 'title: "  "'],
    ['type: profile', ''],
    ['order: 1', 'order: "1"'], ['order: 1', 'order: 1\norder: 2'],
  ]) assert.throws(() => compileContent([{ ...sample(), text: sample().text.replace(from, to) }]), /sample.md:/);
  for (const extra of ['other: true', 'summary: ""', 'links: nope', 'links: [{ label: test, href: "https://example.com", extra: true }]', 'links: [{ label: "", href: "https://example.com" }]']) {
    assert.throws(() => compileContent([sample(extra)]), /sample.md:/);
  }
});
test('C03 重複・不正・予約ID', () => {
  assert.throws(() => compileContent([sample(), sample()]), /重複/);
  for (const id of ['main', 'top', 'navigation', 'related-links', 'CAPS', 'has_space', '2test']) assert.throws(() => compileContent([sample('', '本文', id)]), /id:/);
});
test('C04 全リンク経路の危険URLを拒否', () => {
  const urls = ['http://example.com', 'javascript:alert(1)', 'data:text/plain,x', 'file:///x', '//example.com', '/relative', 'https://user:pass@example.com', 'https://example.com/%0a', 'https://example.com/%5cfoo', '#missing', '#%ZZ'];
  for (const url of urls) {
    assert.throws(() => compileContent([sample('links: [{ label: test, href: "' + url + '" }]')]), /URL:/, url);
    assert.throws(() => compileContent([sample('', '[test](<' + url + '>)')]), /URL:/, url);
    assert.throws(() => compileContent([sample('', '[test][ref]\n\n[ref]: <' + url + '>')]), /URL:/, url);
  }
  assert.throws(() => compileContent([sample('', 'unused\n\n[ref]: http://example.com')]), /URL:/);
  assert.throws(() => compileContent([sample('links: [{ label: test, href: "https://exa\\nmple.com" }]')]), /URL:/);
});
test('C05 HTTPS/mailto/anchor/images・画像参照、欠落・親パス・alt', () => {
  assert.equal(compileContent([sample('links: [{ label: test, href: "mailto:hello@example.com" }]', '[site](https://example.com) [self](#sample)\n\n![仮画像](/images/project-preview.svg)')]).length, 1);
  assert.equal(compileContent([sample('', '![仮画像][picture]\n\n[picture]: /images/project-preview.svg')]).length, 1);
  for (const image of ['![x](https://example.com/a.png)', '![x](/images/missing.svg)', '![](/images/project-preview.svg)', '![x](/images/../favicon.svg)', '![x](/images/%2e%2e/favicon.svg)', '![x](/images/project-preview.svg?x=1)']) assert.throws(() => compileContent([sample('', image)]), /image:/);
  assert.throws(() => compileContent([sample('', '[image as link](/images/project-preview.svg)')]), /URL:/);
});
test('C06 HTML/空本文/空原稿/壊れたYAMLと見出しを拒否、コードは許可', () => {
  for (const body of ['<script>alert(1)</script>', ' ', '# h1', '## h2']) assert.throws(() => compileContent([sample('', body)]), /body:/);
  assert.throws(() => compileContent([]), /0件/);
  assert.throws(() => compileContent([sample('summary: [')]), /YAML:/);
  assert.equal(compileContent([sample('', '```html\n<script>literal</script>\n```')]).length, 1);
});
test('C08 CLI失敗は非ゼロ、成功済みJSONを書き換えない', () => {
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-content-'));
  try {
    mkdirSync(join(directory, 'content'));
    writeFileSync(join(directory, 'content/sample.md'), sample().text);
    const script = resolve('scripts/build-content.mjs');
    const run = () => spawnSync(process.execPath, [script], { cwd: directory, encoding: 'utf8' });
    assert.equal(run().status, 0);
    writeFileSync(join(directory, 'src/generated/bodies/removed.md'), '削除済み原稿');
    assert.equal(run().status, 0);
    assert.throws(() => readFileSync(join(directory, 'src/generated/bodies/removed.md')), /ENOENT/);
    const old = readFileSync(join(directory, 'src/generated/content.json'), 'utf8');
    assert.equal(JSON.parse(old)[0].bodyFile, 'sample.md');
    assert.equal('body' in JSON.parse(old)[0], false);
    assert.equal(readFileSync(join(directory, 'src/generated/bodies/sample.md'), 'utf8').trim(), '本文です。');
    writeFileSync(join(directory, 'content/sample.md'), sample().text.replace('order: 1', 'order: nope'));
    const bad = run();
    assert.notEqual(bad.status, 0);
    assert.match(bad.stderr, /sample.md: order:/);
    assert.equal(readFileSync(join(directory, 'src/generated/content.json'), 'utf8'), old);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('C09 スキル名と0〜100の数値を検証', () => {
  assert.equal(compileContent([sample('skills: [{name: React, level: 80}]', '本文', 'skills', 'skills')])[0].skills[0].level, 80);
  for (const skills of ['nope', '[{name: React, level: -1}]', '[{name: React, level: 101}]', '[{name: React, level: "80"}]', '[{name: "", level: 50}]', '[{name: React, level: 80}, {name: React, level: 40}]', '[{name: React, level: 80, other: true}]']) assert.throws(() => compileContent([sample('skills: ' + skills, '本文', 'skills', 'skills')]), /skills:/);
  assert.throws(() => compileContent([sample('skills: []')]), /skills:/);
});
