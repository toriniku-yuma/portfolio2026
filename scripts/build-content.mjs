import { readdir, readFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import { compileContent } from './content.mjs';

try {
  const names = (await readdir('content')).filter(name => name.endsWith('.md')).sort();
  const sources = await Promise.all(names.map(async name => ({ name, text: await readFile('content/' + name, 'utf8') })));
  const content = compileContent(sources);
  await mkdir('src/generated/bodies', { recursive: true });
  const bodyFiles = new Set(content.map(item => item.id + '.md'));
  for (const name of await readdir('src/generated/bodies')) {
    if (name.endsWith('.md') && !bodyFiles.has(name)) await unlink('src/generated/bodies/' + name);
  }
  const metadata = [];
  for (const { body, ...item } of content) {
    const bodyFile = item.id + '.md';
    await writeFile('src/generated/bodies/' + bodyFile, body + '\n');
    metadata.push({ ...item, bodyFile });
  }
  await writeFile('src/generated/content.json', JSON.stringify(metadata, null, 2) + '\n');
  console.log(content.length + '件の原稿を検証・生成しました');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
