import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1, // Ejecución secuencial para no colisionar estado de memoria
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: [
    {
      command: "node packages/backend/index.js",
      url: "http://localhost:8000/hello",
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "node scripts/serve-frontend.js",
      url: "http://localhost:8081",
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});

