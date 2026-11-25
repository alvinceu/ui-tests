import { test, expect } from '@playwright/test';
import { createPreparedUser, TestUser } from '../helpers/userSetup';

test.describe('Оформление заказа', () => {
    let user: TestUser;

    test.beforeEach(async ({ context, request, baseURL }) => {
        // Создаем и настраиваем нового пользователя через API
        user = await createPreparedUser(request);

        await context.addCookies([
            { name: 'welcomebanner_status', value: 'dismiss', url: baseURL },
            { name: 'cookieconsent_status', value: 'dismiss', url: baseURL },
            { name: 'language', value: 'en', url: baseURL },
        ]);

        // Устанавливаем ОБА значения: token в localStorage и bid в sessionStorage
        await context.addInitScript(({ token, bid }) => {
            window.localStorage.setItem('token', token);
            window.sessionStorage.setItem('bid', bid);
        }, { token: user.token, bid: user.bid });
    });

    test('Переход к созданию заказа', async ({ page }) => {
        await page.goto('/');

        // 1. Добавляем товар в корзину
        const appleJuiceCard = page
            .locator('mat-card')
            .filter({ hasText: 'Apple Juice (1000ml)' });

        await appleJuiceCard.getByRole('button', { name: /Add to Basket/i }).click();

        // 2. Открываем корзину
        await page.getByRole('button', { name: /Show the shopping cart/i }).click();
        await expect(page.getByRole('heading', { name: /Your Basket/i })).toBeVisible();

        // 3. Переходим к оформлению
        const checkoutBtn = page.getByRole('button', { name: /^Checkout$/i });
        await expect(checkoutBtn).toBeEnabled();
        await checkoutBtn.click();

        // 4. Проверяем страницу выбора адреса
        await expect(page).toHaveURL(/#\/address\/select/);
        await expect(page.getByRole('heading', { name: /Select an address/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /^Continue$/i })).toBeVisible();
    });
});
