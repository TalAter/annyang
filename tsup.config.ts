import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/annyang.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: ['src/annyang.ts'],
    format: ['iife'],
    globalName: 'annyang',
    minify: true,
    outExtension: () => ({ js: '.iife.min.js' }),
  },
]);
