import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "playground"),
  build: {
    outDir: resolve(__dirname, "dist-playground"),
    emptyOutDir: true,
    sourcemap: true,
    minify: "esbuild"
  }
});
