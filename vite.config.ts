import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), nodePolyfills()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(mode === "development"
        ? {
            "@cleanmate/cip-sdk": path.resolve(__dirname, "../sdk"),
          }
        : {}),
      buffer: "buffer",
      process: "process/browser",
      stream: "stream-browserify",
      http: "http-browserify",
      https: "https-browserify",
      url: "url",
      util: "util",
      os: "os-browserify/browser",
    },
  },
  define: {
    "process.env": {},
  },
  build: {
    minify: "esbuild",
    commonjsOptions: { transformMixedEsModules: true },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // external: ["@privy-io/react-auth"],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "buffer",
      "process",
      "crypto-browserify",
      "stream-browserify",
      "http-browserify",
      "https-browserify",
      "url",
      "util",
      "os-browserify",
      "mersenne-twister",
      "@privy-io/react-auth",
    ],
  },
}));
