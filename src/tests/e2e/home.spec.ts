
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should display header', async ({ page }) => {
        await expect(page.getByText('Foodie')).toBeVisible();
    });

    test('should display promo banner', async ({ page }) => {
        await expect(page.getByText('50% OFF')).toBeVisible();
    });

    test('should display categories', async ({ page }) => {
        await expect(page.getByText('Pizza')).toBeVisible();
        await expect(page.getByText('Burger')).toBeVisible();
    });

    test('should display restaurants', async ({ page }) => {
        await expect(page.getByText('Burger King')).toBeVisible();
        await expect(page.getByText('Pizza Hut')).toBeVisible();
    });

    test('should navigate to restaurant page', async ({ page }) => {
        await page.getByText('Burger King').click();

        await expect(page).toHaveURL(/\/restaurant\/1/);
        await expect(page.getByRole('heading', { name: 'Burger King' })).toBeVisible();
    });
});