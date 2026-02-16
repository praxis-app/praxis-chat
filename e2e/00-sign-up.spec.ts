import { expect, test } from '@playwright/test';

test('first user can sign up on a fresh instance', async ({ page }) => {
  const uniqueSuffix = Date.now().toString().slice(-6);
  const username = `e2e_${uniqueSuffix}`;
  const email = `e2e_${uniqueSuffix}@example.com`;
  const password = 'Password123!';

  await page.goto('/auth/signup');

  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/s\/[^/]+\/c\/[^/]+$/, { timeout: 30_000 });
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('access_token')))
    .not.toBeNull();
});
