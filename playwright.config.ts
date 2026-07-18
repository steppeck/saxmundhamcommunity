import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/accessibility",
  use: { baseURL: "http://127.0.0.1:3007", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm dev --port 3007",
    url: "http://127.0.0.1:3007",
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    { name: "mobile", use: { ...devices["Pixel 5"], channel: "chrome" } },
  ],
});
