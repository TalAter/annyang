import { readFileSync } from 'fs';
import typescript from '@rollup/plugin-typescript';

const { version } = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `//! annyang
//! version : ${version}
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/`;

export default {
  input: 'src/annyang.ts',
  output: [
    {
      file: 'dist/annyang.js',
      format: 'iife',
      name: 'annyang',
      banner,
    },
    {
      file: 'dist/annyang.mjs.js',
      format: 'esm',
      banner,
    },
    {
      file: 'dist/annyang.cjs.js',
      format: 'cjs',
      banner,
    },
  ],
  plugins: [typescript()],
};
