import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results/firebase",
  testMatch: ["firebase-ui.spec.ts", "subscription-ui.spec.ts"],
  workers: 1,
  timeout: 60000,
  use: { baseURL: "http://127.0.0.1:5179", headless: true },
  webServer: {
    command: "npm run dev -- --port 5179 --strictPort",
    url: "http://127.0.0.1:5179",
    reuseExistingServer: false,
    env: {
      VITE_FIREBASE_API_KEY: "demo-api-key",
      VITE_FIREBASE_PROJECT_ID: "demo-forma",
      VITE_FIREBASE_AUTH_DOMAIN: "demo-forma.firebaseapp.com",
      VITE_FIREBASE_APP_ID: "1:123:web:demo",
      VITE_USE_FIREBASE_EMULATORS: "true",
    },
  },
  reporter: "list",
});
