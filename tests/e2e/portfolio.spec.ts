import { test, expect } from '@playwright/test';
import content from '../../src/generated/content.json' with { type: 'json' };

test('名前、全本文、不要な案内の削除、Markdownとスキル値', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page).toHaveTitle(/Kawakami Shunki（川上駿季）/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kawakami Shunki');
  await expect(page.locator('[data-content-id]')).toHaveCount(5);
  const skill = content.find(item => item.type === 'skills')?.skills?.[0];
  if (skill) await expect(page.getByRole('meter', { name: skill.name, exact: true })).toHaveAttribute('aria-valuenow', String(skill.level));
  await expect(page.locator('body')).not.toContainText(/2026|すべて表示|表示済み|ページ内検索|モック|サンプル原稿|気軽にご覧/);
  expect(errors).toEqual([]);
});

test('スクロール初回のみ演出し、戻ってもDOMと表示履歴を維持', async ({ page }) => {
  await page.goto('./');
  const target = page.locator('[data-content-id="skills"]');
  await expect(target).not.toHaveAttribute('data-seen', 'true');
  await expect(target).toHaveCSS('opacity', '0');
  await page.evaluate(() => {
    const element = document.querySelector('[data-content-id="skills"]')!;
    (window as unknown as { original: Element }).original = element;
    element.addEventListener('animationstart', event => {
      if (event.target === element) element.setAttribute('data-starts', String(Number(element.getAttribute('data-starts') || 0) + 1));
    });
  });
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute('data-seen', 'true');
  await expect(target).toHaveAttribute('data-starts', '1');
  await expect(target).not.toHaveAttribute('data-animated', 'true');
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator('#top').scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute('data-starts', '1');
  expect(await target.evaluate(element => element === (window as unknown as { original: Element }).original)).toBe(true);
});

test('B案を採用し、比較UIを除去、アスタリスクを表示', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('[data-design-study]')).toHaveCount(0);
  await expect(page.getByText('カードデザイン比較')).toHaveCount(0);
  await expect(page.locator('[data-content-id="profile"]')).toHaveCSS('border-left-width', '1px');
  await expect(page.locator('[data-decoration] svg').last()).toBeVisible();
  await expect(page.getByText('THINK. BUILD. REPEAT.')).toBeVisible();
});

test('見出しが画面の下端に来ただけでは開始せず、内側に入って開始', async ({ page }) => {
  await page.goto('./');
  const target = page.locator('[data-content-id="skills"]');
  await target.evaluate(element => scrollBy(0, element.getBoundingClientRect().top - innerHeight + 50));
  await page.waitForTimeout(200);
  await expect(target).not.toHaveAttribute('data-seen', 'true');
  await expect(target).toHaveCSS('opacity', '0');
  await page.evaluate(() => scrollBy(0, Math.min(200, innerHeight * .25) + 80));
  await expect(target).toHaveAttribute('data-animated', 'true');
  await expect(page.locator('#skills')).toBeInViewport();
});

test('アンカー、履歴、同じリンク、初期ハッシュ', async ({ page }) => {
  await page.goto('./#contact');
  await expect(page.locator('#contact')).toBeInViewport();
  await page.getByRole('navigation').getByRole('link', { name: 'プロフィール', exact: true }).click();
  await expect(page.locator('#profile')).toBeFocused();
  await page.goBack();
  await expect(page.locator('#contact')).toBeInViewport();
  await page.goForward();
  await expect(page.locator('#profile')).toBeInViewport();
  await page.getByRole('navigation').getByRole('link', { name: 'プロフィール', exact: true }).click();
  await expect(page.locator('#profile')).toBeFocused();
});

test('reduce・印刷でも全本文が読める', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.locator('[data-content-id="skills"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-animated]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('#top').scrollIntoViewIfNeeded();
  await page.locator('[data-content-id="skills"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-content-id="skills"]')).not.toHaveAttribute('data-animated', 'true');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-content-id]')).toHaveCount(5);
  for (const element of await page.locator('[data-content-id]').all()) {
    expect(await element.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  }
});

test('幅320〜1440px、長文と画像が横にはみ出さない', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await page.locator('[data-content-id="profile"] p').first().evaluate(element => { element.textContent = 'https://example.com/' + 'long-path'.repeat(80); });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.locator('img').scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator('img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
});


test('目次だけ下線を表示し、本文リンクは緩やかにフェードする', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  expect(await page.locator('a:not([data-app-link])').count()).toBe(0);
  const link = page.locator('[data-content-id="profile"] a').first();
  await link.scrollIntoViewIfNeeded();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(link).toHaveCSS('background-image', 'none');
  await expect(link).toHaveCSS('transition-duration', '0.4s');
  const supportsHover = await page.evaluate(() => matchMedia('(hover: hover)').matches);
  await link.hover();
  await expect(link).toHaveCSS('opacity', supportsHover ? '0.8' : '1');
  // Keyboard focus remains available even when the primary input is touch.
  await page.keyboard.press('Tab');
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('opacity', '0.8');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  const navigationLink = page.getByRole('navigation').getByRole('link').first();
  if (supportsHover) await navigationLink.hover();
  else await navigationLink.focus();
  await expect(navigationLink).toHaveCSS('background-size', '100% 1px');
  await expect(navigationLink).toHaveCSS('opacity', '1');
});

test('スクロールで目次が追従し、末尾・逆方向・先頭でも更新する', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  const selected = page.locator('nav a[aria-current="location"]');
  for (const id of ['profile', 'career-01', 'skills']) {
    await page.locator(`[id="${id}"]`).evaluate(element => element.scrollIntoView());
    await expect(selected).toHaveAttribute('href', '#' + id);
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect(selected).toHaveAttribute('href', '#contact');
  await page.locator('#career-01').evaluate(element => element.scrollIntoView());
  await expect(selected).toHaveAttribute('href', '#career-01');
  await page.evaluate(() => scrollTo(0, 0));
  await expect(selected).toHaveCount(0);
  expect(new URL(page.url()).hash).toBe('');
});

test('リンク移動は即時ジャンプせず滑らかに移動する', async ({ page }) => {
  await page.goto('./');
  const positions = await page.getByRole('navigation').getByRole('link', { name: 'このサイト・連絡先' }).evaluate(element => {
    const before = scrollY;
    (element as HTMLAnchorElement).click();
    return { before, after: scrollY };
  });
  expect(positions.after).toBe(positions.before);
  await expect(page.locator('#contact')).toBeInViewport();
  await expect(page.locator('[data-content-id="contact"]')).toHaveCSS('opacity', '1');
});

test('ドット移動・読み込みフェードと停止ボタンなし、検索・フォーカス救済', async ({ page }) => {
  await page.goto('./');
  const art = page.locator('[data-decoration]');
  expect(await art.evaluate(el => getComputedStyle(el, '::before').animationName)).toBe('dot-drift');
  expect(await page.locator('h1').evaluate(el => getComputedStyle(el).animationName)).toBe('page-enter');
  await expect(page.getByRole('button', { name: '背景アニメーションを停止' })).toHaveCount(0);
  await page.locator('[data-content-id="profile"] a').first().focus();
  await expect(page.locator('[data-content-id="profile"]')).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true })));
  for (const card of await page.locator('[data-content-id]').all()) await expect(card).toHaveCSS('opacity', '1');
});

test('目次の読み込み演出と選択色、トップ下の罫線と余白', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./#career-01');
  const navigation = page.getByRole('navigation');
  expect(await navigation.evaluate(element => getComputedStyle(element).animationName)).toBe('page-enter');
  const selectedLink = navigation.getByRole('link', { name: 'これまでの歩み' });
  await navigation.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
  await expect(selectedLink).toHaveAttribute('aria-current', 'location');
  // Move the pointer without the automation's scrollIntoView changing the reading position.
  const bounds = (await selectedLink.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(selectedLink).toHaveAttribute('aria-current', 'location');
  await expect(selectedLink).toHaveCSS('color', 'rgb(136, 250, 78)');
  await expect(page.locator('#top')).toHaveCSS('border-bottom-width', '1px');
  await expect(page.locator('#top')).toHaveCSS('border-bottom-color', 'rgb(53, 66, 53)');
  await expect(page.locator('[data-content-id="profile"]')).toHaveCSS('border-left-color', 'rgb(136, 250, 78)');
  await expect(page.locator('#top')).toHaveCSS('margin-bottom', '32px');
});
