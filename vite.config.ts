/// <reference types="vite/client" />
/// <reference types="vitest" />

import { defineConfig } from "vite";
import { URL, fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { minify } from "terser";

import dts from "vite-plugin-dts";

function minifyBundles() {
  return {
    name: "minifyBundles",
    async generateBundle(options, bundle) {
      for (let key in bundle) {
        if (bundle[key].type == 'chunk' && key.endsWith('.js')) {
          const minifyCode = await minify(bundle[key].code, { sourceMap: false })
          bundle[key].code = minifyCode.code
        }
      }
      return bundle
    },
  }
}

export default defineConfig({
  plugins: [
    dts({
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    }),
    minifyBundles(),
  ],
  build: {
    copyPublicDir: false,
    sourcemap: false,
    minify: true,
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
