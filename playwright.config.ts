import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "app.spec.ts",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:5177", headless: true },
  webServer: {
    command: "npm run dev -- --port 5177 --strictPort",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: true,
  },
  reporter: "list",
});
