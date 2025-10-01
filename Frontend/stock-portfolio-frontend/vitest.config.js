import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.js",
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'vitest.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        'setupTests.js',
        'src/index.js',
        'src/reportWebVitals.js',
        'src/setupTests.js',
      ],
    }
  },
});