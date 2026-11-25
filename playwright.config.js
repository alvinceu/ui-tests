const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
    use: {
        browserName: 'chromium',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
});
