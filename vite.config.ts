import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/\/(?:@firebase|firebase)\/firestore/.test(id))
              return "firebase-firestore";
            if (/\/(?:@firebase|firebase)\/auth/.test(id))
              return "firebase-auth";
            if (id.includes("firebase")) return "firebase-core";
            if (/\/(?:react|react-dom|scheduler)\//.test(id))
              return "react-vendor";
          }
        },
      },
    },
  },
});
