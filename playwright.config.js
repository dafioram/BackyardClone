// Playwright configuration for the Backyard Clone smoke tests.
module.exports = {
  testDir: './tests',
  timeout: 120000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    headless: true,
    // Use system Chromium when Playwright's bundled browser isn't available
    // (e.g. local dev). CI installs Playwright's Chromium and ignores this.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
};
