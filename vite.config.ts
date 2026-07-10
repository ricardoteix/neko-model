import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ChenER",
      fileName: (format) => `chen-er.${format}.js`,
      formats: ["es", "umd"]
    },
    rollupOptions: {
      external: [], // Bundles dagre directly so the library is 100% standalone
      output: {
        globals: {}
      }
    },
    sourcemap: true,
    minify: "esbuild"
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ]
});
