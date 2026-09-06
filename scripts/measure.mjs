import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer-core';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import os from 'node:os';

const url = process.env.MEASURE_URL || 'http://127.0.0.1:4173/';
const out = process.env.MEASURE_OUT || 'docs/verification-results/2026-09-06-redesign';
await mkdir(out, { recursive: true });
const artifacts = [];
async function sizes(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await sizes(path);
    else {
      const data = await readFile(path);
      artifacts.push({ path, bytes: data.length, gzipBytes: gzipSync(data).length, sha256: createHash('sha256').update(data).digest('hex') });
    }
  }
}
await sizes('dist');
await writeFile(join(out, 'bundle.json'), JSON.stringify({ artifacts, totalBytes: artifacts.reduce((sum, item) => sum + item.bytes, 0), totalGzipBytes: artifacts.reduce((sum, item) => sum + item.gzipBytes, 0) }, null, 2));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.screenshot({ path: join(out, width + '-hero.png') });
    await page.screenshot({ path: join(out, width + '-initial.png'), fullPage: true });
    await page.locator('img').scrollIntoViewIfNeeded();
    await page.locator('img').evaluate(img => img.decode());
    await page.evaluate(() => scrollTo(0, 0));
    await page.mouse.move(0, 0);
    await page.screenshot({ path: join(out, width + '-all.png'), fullPage: true });
    if (width === 1440) await page.pdf({ path: join(out, 'print.pdf'), format: 'A4', printBackground: true });
  }
  const palette = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(['canvas', 'panel', 'ink', 'muted', 'accent'].map(name => [name, style.getPropertyValue('--color-' + name).trim()]));
  });
  const luminance = hex => {
    const normalized = hex.length === 4 ? '#' + [...hex.slice(1)].map(digit => digit + digit).join('') : hex;
    const rgb = normalized.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const pairs = [['ink', 'panel'], ['muted', 'panel'], ['accent', 'panel'], ['canvas', 'accent'], ['accent', 'canvas'], ['muted', 'canvas']].map(([foreground, background]) => {
    const values = [luminance(palette[foreground]), luminance(palette[background])].sort((a, b) => b - a);
    return { foreground, background, ratio: (values[0] + 0.05) / (values[1] + 0.05) };
  });
  if (pairs.some(pair => !Number.isFinite(pair.ratio) || pair.ratio < 4.5)) throw new Error('文字色のコントラスト不足');
  await writeFile(join(out, 'contrast.json'), JSON.stringify({ palette, pairs }, null, 2));
} finally { await browser.close(); }

if (!process.argv.includes('--screenshots-only')) {
  const runs = [];
  for (const reduced of [false, true]) {
    for (const formFactor of ['mobile', 'desktop']) {
      for (let run = 1; run <= 3; run++) {
        const browser = await chromium.launch({ args: ['--remote-debugging-port=9231', ...(reduced ? ['--force-prefers-reduced-motion=reduce'] : [])] });
        try {
          const connection = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9231' });
          const page = await connection.newPage();
          await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
          const media = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
          if (media !== reduced) throw new Error('reduce設定がブラウザーに反映されていません');
          const result = await lighthouse(url, { port: 9231, output: 'html', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, formFactor === 'desktop' ? desktopConfig : undefined, page);
          if (!result || result.lhr.runtimeError) throw new Error(JSON.stringify(result?.lhr.runtimeError));
          const name = formFactor + '-' + (reduced ? 'reduce' : 'normal') + '-' + run;
          await writeFile(join(out, name + '.html'), result.report);
          const lhr = result.lhr;
          const metrics = Object.fromEntries(['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint', 'speed-index'].map(id => [id, lhr.audits[id].numericValue]));
          const record = {
            name, formFactor, reduced, run, url, date: lhr.fetchTime, lighthouse: lhr.lighthouseVersion,
            browser: lhr.userAgent, os: os.platform() + ' ' + os.release(), node: process.version,
            settings: lhr.configSettings, environment: lhr.environment,
            scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, value.score])),
            metrics, failures: Object.values(lhr.audits).filter(audit => audit.score !== null && audit.score < 1).map(audit => ({ id: audit.id, title: audit.title, score: audit.score, displayValue: audit.displayValue })),
          };
          runs.push(record);
          await writeFile(join(out, 'lighthouse.json'), JSON.stringify(runs, null, 2));
          console.log(name, JSON.stringify(record.scores), JSON.stringify(metrics));
} finally { await browser.close(); }
      }
    }
  }
  const medians = [];
  for (const reduced of [false, true]) for (const formFactor of ['mobile', 'desktop']) {
    const subset = runs.filter(run => run.reduced === reduced && run.formFactor === formFactor);
    const median = values => values.sort((a, b) => a - b)[1];
    medians.push({ reduced, formFactor, scores: Object.fromEntries(Object.keys(subset[0].scores).map(key => [key, median(subset.map(run => run.scores[key]))])), metrics: Object.fromEntries(Object.keys(subset[0].metrics).map(key => [key, median(subset.map(run => run.metrics[key]))])) });
  }
  await writeFile(join(out, 'medians.json'), JSON.stringify(medians, null, 2));
}
