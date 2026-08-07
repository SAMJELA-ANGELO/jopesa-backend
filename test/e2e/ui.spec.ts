import { test, expect } from '@playwright/test';

test('frontend homepage loads', async ({ page }) => {
  // frontend should be running on port 3001 in CI
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  const title = await page.title();
  expect(title).toBeTruthy();
});
