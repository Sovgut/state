/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig } from "vite";
import { URL, fileURLToPath } from "node:url";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

import * as packageJson from './package.json'

export default defineConfig({
  plugins: [dts()],
  build: {
    copyPublicDir: false,
    lib: {
      fileName: "main",
      entry: resolve("src", "main.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
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
