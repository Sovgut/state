/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig } from "vite";
import { URL, fileURLToPath } from "node:url";
import { resolve } from "node:path";

import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
      outDir: "dist", // Ensure types are output to dist
      entryRoot: "src",  // Ensure correct root for types
    }),
  ],
  build: {
    copyPublicDir: false,
    sourcemap: false,
    lib: {
      fileName: "main",
      name: '@sovgut/state',
      entry: resolve("src", "main.ts"),
      formats: ["es"],
    },
  },
  optimizeDeps: {
    include: ["eventemitter3"],
  },
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      exclude: ["**/src/main.ts"],
    },
  },
});
