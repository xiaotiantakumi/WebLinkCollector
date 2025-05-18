// Import ESLint plugins
import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import jestPlugin from 'eslint-plugin-jest';
import prettier from 'eslint-config-prettier';

export default [
  // Apply recommended rules to all files
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'jest.config.js', '.husky/**'],
  },
  {
    // Apply common globals for all files
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Web API globals since we use fetch
        fetch: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        // NodeJS namespace
        NodeJS: 'readonly',
      },
    },
  },
  {
    // Apply TypeScript rules to TypeScript files
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // We use any in specific cases
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Apply Jest rules to all test files
    files: ['**/*.test.ts', '**/tests/**/*.ts'],
    languageOptions: {
      globals: {
        // Jest globals
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        require: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      // Allow require in tests
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  // Apply additional rules to all files
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'off', // We need console for the CLI and logging module
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'quote-props': ['error', 'as-needed'],
      'spaced-comment': ['error', 'always'],
    },
  },
  // Apply Prettier rules (to avoid conflicts)
  prettier,
];
