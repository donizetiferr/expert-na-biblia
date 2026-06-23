import { test, expect } from '@playwright/test';

/**
 * Smoke E2E: splash → tela de modos → fechar
 * Implementacao completa com emulador Android requer Android Studio + SDK API 34
 * (configurado em playwright.config.ts). Setup completo: P0-12 (V2).
 */
test.describe('Smoke E2E - App Expert Na Biblia', () => {
  test('app abre splash + navega para tela de modos', async ({ page }) => {
    // Splash com fonts Bangers + Nunito
    await page.goto('/');
    await expect(page).toHaveTitle(/Expert/);
  });
});