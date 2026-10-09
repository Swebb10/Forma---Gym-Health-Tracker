import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results/demo",
  testMatch: [
    "app.spec.ts",
    "i18n.spec.ts",
    "nutrition.spec.ts",
    "training-update.spec.ts",
    "subscription-demo.spec.ts",
  ],
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:5177", headless: true },
  webServer: {
    command: "npm run dev -- --port 5177 --strictPort",
    url: "http://127.0.0.1:5177",
    reuseExistingServer: false,
    env: { VITE_FIREBASE_API_KEY: "", VITE_USE_FIREBASE_EMULATORS: "false" },
  },
  reporter: "list",
});
