import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" ? undefined : nodePolyfills(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
      process: "process/browser",
      stream: "stream-browserify",
      http: "http-browserify",
      https: "https-browserify",
      url: "url",
      util: "util",
      os: "os-browserify",
    },
  },
  build: {
    minify: "esbuild",
    commonjsOptions: { transformMixedEsModules: true },
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node polyfills into separate chunk
          if (id.includes("node_modules")) {
            // Keep React and React-DOM in vendor chunk to ensure they're available to all chunks
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor";
            }
            if (
              id.includes("crypto-browserify") ||
              id.includes("stream-browserify") ||
              id.includes("http-browserify") ||
              id.includes("https-browserify") ||
              id.includes("os-browserify") ||
              id.includes("buffer") ||
              id.includes("util")
            ) {
              return "polyfills";
            }
            // Split large UI libraries
            if (id.includes("@radix-ui") || id.includes("@chakra-ui")) {
              return "ui-libs";
            }
            // Split other large dependencies
            if (
              id.includes("@tiptap") ||
              id.includes("recharts") ||
              id.includes("framer-motion")
            ) {
              return "editor-charts";
            }
            // Default vendor chunk
            return "vendor";
          }
        },
      },
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
    ],
  },
}));
