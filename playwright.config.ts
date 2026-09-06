import { defineConfig, devices } from '@playwright/test';
const production = !!process.env.E2E_PREVIEW;
const base = process.env.VITE_BASE_PATH || '/';
const port = process.env.E2E_PORT || '4173';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 3,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: process.env.E2E_REPORT || 'test-results/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:' + port + base, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: process.env.E2E_CHANNEL } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: production ? 'vite preview --host 127.0.0.1 --port ' + port + ' --strictPort' : 'node scripts/build-content.mjs && vite --host 127.0.0.1 --port ' + port + ' --strictPort',
    url: 'http://127.0.0.1:' + port + base,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
