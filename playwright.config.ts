import { defineConfig } from '@playwright/test'

const dev = process.env.VIEWER_DEV === '1'
const baseURL = dev ? 'http://127.0.0.1:5173/' : 'http://127.0.0.1:4173/'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: {
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--enable-webgl', '--use-angle=swiftshader'],
    },
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: dev ? 'npm run dev -- --host 127.0.0.1' : 'npm run build && npm run preview -- --host 127.0.0.1',
    url: dev ? 'http://127.0.0.1:5173/' : 'http://127.0.0.1:4173/', 
    reuseExistingServer: !process.env.CI,
  },
})
