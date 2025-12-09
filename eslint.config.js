import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];
const storybookFiles = [
  '**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)',
  '**/*.story.@(ts|tsx|js|jsx|mjs|cjs)',
  '.storybook/**/*.@(ts|tsx|js|jsx|mjs|cjs)'
];

const withTypeInfo = (config) => ({
  ...config,
  files: config.files ?? tsFiles,
  languageOptions: {
    ...config.languageOptions,
    parser: tsParser,
    parserOptions: {
      ...(config.languageOptions?.parserOptions ?? {}),
      ecmaFeatures: { jsx: true }
    },
    globals: {
      ...globals.browser,
      ...globals.es2021,
      ...(config.languageOptions?.globals ?? {})
    }
  }
});

export default [
  {
    ignores: ['dist', 'storybook-static', 'node_modules', 'src-tauri/target']
  },
  ...tsPlugin.configs['flat/recommended'].map(withTypeInfo),
  ...tsPlugin.configs['flat/stylistic'].map(withTypeInfo),
  {
    files: tsFiles,
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  },
  ...storybook.configs['flat/recommended'].map((config) => ({
    ...config,
    files: config.files ?? storybookFiles,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...(config.languageOptions?.globals ?? {})
      }
    }
  })),
  {
    files: storybookFiles,
    rules: {
      '@typescript-eslint/no-empty-function': 'off'
    }
  }
];
