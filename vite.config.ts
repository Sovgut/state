import { fileURLToPath, URL } from "node:url";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    dts({
      // Use the app config so path aliases and `include` match the source graph.
      tsconfigPath: "./tsconfig.app.json",
      // Emit per-file declarations mirroring `src`; `main.d.ts` is the entry.
      entryRoot: "src",
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "src/vite-env.d.ts",
      ],
    }),
  ],
  build: {
    target: "es2023",
    // Ship readable output; consumers minify as part of their own bundle.
    minify: false,
    sourcemap: true,
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL("./src/main.ts", import.meta.url)),
      fileName: "main",
      formats: ["es"],
    },
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
