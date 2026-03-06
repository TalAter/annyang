import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/'],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'off',
      'max-len': ['error', { code: 120, ignoreComments: true }],
    },
  },
  {
    files: ['test/**/*.test.ts', 'test/**/*.js'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      'max-len': 'off',
    },
  },
  {
    files: ['src/annyang.ts'],
    rules: {
      'no-use-before-define': 'off',
    },
  },
);
