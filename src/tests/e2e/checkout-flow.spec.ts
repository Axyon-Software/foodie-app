import { test, expect } from '@playwright/test';

test.describe('Complete Checkout Flow', () => {
    test('should complete entire order flow', async ({ page }) => {

        await page.goto('/');


        await page.getByText('Burger King').click();
        await expect(page).toHaveURL(/\/restaurant\/1/);


        await page.getByText('Whopper').click();
        await page.getByRole('button', { name: /adicionar/i }).click();


        await page.goto('/cart');
        await expect(page.getByText('Whopper')).toBeVisible();


        await page.getByPlaceholder(/cupom/i).fill('PRIMEIRA');
        await page.getByRole('button', { name: /aplicar/i }).click();
        await expect(page.getByText(/desconto/i)).toBeVisible();


        await page.getByRole('link', { name: /pagamento/i }).click();
        await expect(page).toHaveURL('/checkout');


        await page.getByLabel(/rua/i).fill('Rua das Flores');
        await page.getByLabel(/número/i).fill('123');
        await page.getByLabel(/bairro/i).fill('Centro');
        await page.getByLabel(/cidade/i).fill('São Paulo');


        await page.getByLabel(/uf/i).selectOption('SP');

        await page.getByLabel(/cep/i).fill('01234-567');


        await page.getByText('Pix').click();


        await page.getByRole('button', { name: /confirmar pedido/i }).click();


        await expect(page).toHaveURL(/\/order\//);
        await expect(page.getByText(/pedido confirmado/i)).toBeVisible();
        await expect(page.getByText(/previsão de entrega/i)).toBeVisible();
    });
});