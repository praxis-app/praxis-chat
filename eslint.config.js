import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      curly: 'error',
      // Disable new v7.x react-hooks rules that require significant refactoring
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // CommonJS configuration files
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  // ES module Node.js scripts
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  // Browser JS files
  {
    files: ['view/public/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        localStorage: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
  },
);
