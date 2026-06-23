import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config para testes E2E em emulador Android.
 * Setup completo: P0-12 (V2).
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results/',
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'android-emulator',
      use: {
        ...devices['Pixel 5'],
        // Requer Android Studio + emulator Android API 34+
        // `npx playwright install android` para setup inicial
      },
    },
  ],
  webServer: {
    command: 'npx expo start --android',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});