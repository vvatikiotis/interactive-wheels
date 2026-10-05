import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    browserName: 'chromium',
    launchOptions: {
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--enable-webgl', '--use-angle=swiftshader'],
    },
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
  },
})
