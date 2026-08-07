import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// ============================================================
// Imports describe ARCHITECTURE, not folders.
//
// @kernel  — the contract every room must satisfy
// @domains — manufacturing domain knowledge
// @ui      — shared console primitives
//
// The kernel currently lives in src/os. Because nothing imports a path,
// relocating it to src/kernel is a change to THIS FILE ONLY — one line per
// alias — instead of rewriting every consumer. That is the point of the
// alias contract: the kernel's location stops being load-bearing.
// ============================================================
const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react({ include: /\.(jsx|js)$/ })],
  server: { port: 5173 },
  resolve: {
    alias: {
      "@kernel":  r("./src/os"),
      "@ui":      r("./src/os"),
      "@domains": r("./src/domains"),
      "@rooms":   r("./src/rooms"),
    },
  },
});
