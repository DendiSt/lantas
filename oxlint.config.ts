import { defineConfig } from "oxlint";

export default defineConfig({
  ignorePatterns: [
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".continue/**",
    ".cursor/**",
    ".gemini/**",
    ".opencode/**",
    ".pi/**",
    ".roo/**",
    ".windsurf/**",
    "tools/oxlint/anti-slop/**",
    ".next/**",
    "node_modules/**",
    "dist/**",
    "public/**",
    "__tests__/**",
  ],
  jsPlugins: [
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
  ],
  rules: {
    // Aturan Kritis (Tetap Error untuk menjaga performa & arsitektur bebas bug)
    "oxc/no-accumulating-spread": "error",
    "anti-slop/no-reduce-accumulator-copy": "error",
    "anti-slop/no-array-filter-map": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-shape-in-symbol-names": "error",

    // Aturan Pengetikan, Mocking & Spasi (Diubah ke 'warn' agar informatif tanpa memblokir)
    "anti-slop/no-module-mocking": "warn",
    "anti-slop/no-runtime-typeof": "warn",
    "anti-slop/no-unsafe-dictionary-type": "warn",
    "anti-slop/no-chained-type-assertions": "warn",
    "anti-slop/no-known-value-widening": "warn",
    "anti-slop/no-object-parameters": "warn",
    "anti-slop/no-unknown-parameters": "warn",
    "anti-slop/no-unknown-returns": "warn",
    "anti-slop/no-unknown-type-aliases": "warn",
    "anti-slop/no-widen-then-assert": "warn",
    "anti-slop/require-readable-spacing": "warn",

    // Dinonaktifkan karena terlalu rewel untuk frontend Next.js (searchParams, casting JSX, dll)
    "anti-slop/require-safety-comment-for-type-assertion": "off",
    "no-unused-vars": "warn",
  },
});
