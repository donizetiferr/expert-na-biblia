/**
 * V18.4 (ME.3): config Jest minima.
 * - Exclui o spec Playwright (__tests__/e2e) que NAO deve ser coletado pelo Jest
 *   (ele roda via `npm run test:e2e` com @playwright/test).
 * - Transform via babel-jest (babel.config.js: babel-preset-expo).
 */
module.exports = {
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/e2e/'],
};
