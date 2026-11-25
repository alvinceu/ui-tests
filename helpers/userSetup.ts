import { APIRequestContext, expect } from '@playwright/test';

export interface TestUser {
    email: string;
    password: string;
    token: string;
    bid: string;
}

export async function createPreparedUser(request: APIRequestContext): Promise<TestUser> {
    // Генерируем уникальный email, чтобы не получать ошибку "Email must be unique"
    const email = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;
    const password = 'Password123!';

    // 1. Регистрация пользователя
    const registerRes = await request.post('/api/Users/', {
        data: {
            email,
            password,
            passwordRepeat: password,
            securityQuestion: {
                id: 1,
                question: 'Your eldest siblings middle name?',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            securityAnswer: 'Alex',
        },
    });
    expect(registerRes.status()).toBe(201);

    // 2. Логин для получения token и bid (Basket ID)
    const loginRes = await request.post('/rest/user/login', {
        data: { email, password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const { authentication } = await loginRes.json();

    const authHeaders = {
        Authorization: `Bearer ${authentication.token}`,
    };

    // 3. Добавляем адрес доставки (нужен для Checkout)
    const addressRes = await request.post('/api/Addresss/', {
        headers: authHeaders,
        data: {
            country: 'Russia',
            fullName: 'Ivan Ivanov',
            mobileNum: 7777777777,
            zipCode: '190000',
            streetAddress: 'Nevsky Prospect, 1',
            city: 'Saint Petersburg',
            state: 'SPb',
        },
    });
    expect(addressRes.status()).toBe(201);

    // 4. Добавляем способ оплаты (нужен для Checkout)
    const cardRes = await request.post('/api/Cards/', {
        headers: authHeaders,
        data: {
            fullName: 'Ivan Ivanov',
            cardNum: 1234567812345678, // 16 цифр
            expMonth: '12',
            expYear: '2085',
        },
    });
    expect(cardRes.status()).toBe(201);

    return {
        email,
        password,
        token: authentication.token,
        bid: String(authentication.bid),
    };
}
