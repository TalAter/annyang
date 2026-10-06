import { defineConfig } from 'vitest/config';
import QuietReporter from './test/quiet-reporter.js';

export default defineConfig({
  test: {
    reporters: [new QuietReporter()],
    projects: [
      {
        test: {
          name: 'supported',
          setupFiles: './test/setupTests.js',
          include: ['test/specs/annyang.test.ts', 'test/specs/issues.test.ts'],
        },
      },
      {
        test: {
          name: 'unsupported',
          include: ['test/specs/no-speech-support.test.ts'],
        },
      },
    ],
  },
});
