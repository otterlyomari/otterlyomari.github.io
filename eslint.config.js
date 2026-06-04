import js from '@eslint/js';
import astroParser from 'astro-eslint-parser';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettierRecommended,

  {
    ignores: ['dist', 'node_modules', '.astro', 'build'],
  },

  {
    files: ['**/*.{js,ts}'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        Fuse: 'readonly',
      },
    },

    plugins: {
      import: importPlugin,
    },

    settings: {
      'import/resolver': {
        node: true,
      },
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off',

      'no-eval': 'error',
      'no-implied-eval': 'error',

      '@typescript-eslint/no-unused-expressions': 'off',

      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',

      'no-magic-numbers': 'off',
    },
  },

  {
    files: ['scripts/**/*.{js,mjs,ts}'],

    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  {
    files: ['**/*.astro'],

    languageOptions: {
      parser: astroParser, // Use the imported parser
      parserOptions: {
        parser: tseslint.parser, // Important for TypeScript in Astro
        extraFileExtensions: ['.astro'],
      },
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      'import/order': 'off',
      'import/no-duplicates': 'off',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',

      'no-undef': 'off',
    },
  },

  prettier,
];
