import typescriptEslint from '@typescript-eslint/eslint-plugin'
import react from 'eslint-plugin-react'
import jsxA11Y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  {
    ignores: [
      '**/.cache/',
      '**/build/',
      '**/dist/',
      '**/node_modules/',
      '**/public/',
      '**/out/',
      '**/staticBuild/',
    ],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react,
      'jsx-a11y': jsxA11Y,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },

      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-non-null-assertion': 2,
      '@typescript-eslint/no-unused-vars': 2,
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],

      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          trailingComma: 'all',
        },
      ],

      'react/no-unknown-property': [
        2,
        {
          ignore: ['jsx'],
        },
      ],

      'react/prop-types': 0,
      'react/react-in-jsx-scope': 'off',
      'sort-keys': 0,
    },
  },
]

export default eslintConfig
