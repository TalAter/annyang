import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
