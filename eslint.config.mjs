import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import { importX } from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

// The barrelled folders in app. Import these folders through their public index.ts.
const barrels = ['components', 'design-system', 'lib', '.server']

const noDeepImports = {
  regex: `^~/(${barrels.map((folder) => folder.replace('.', '\\.')).join('|')})/`,
  message: "Import from the folder's index.ts, or use ./ inside the folder.",
}
const noParentReach = {
  regex: '^\\.\\./(\\.\\./|[^/]+/)',
  message: 'Go up one level at most and stop there. Use ~/ for anything further.',
}
const noFolderReach = {
  regex: '^\\./(?!\\+types/)[^/]+/',
  message: "Import from the subfolder's index.ts.",
}
const noOwnBarrel = {
  regex: '^\\.{1,2}/?$|/index(\\.tsx?)?$',
  message: 'Import the file itself. Going through an index.ts risks an import cycle.',
}
const appPatterns = [noDeepImports, noParentReach, noFolderReach, noOwnBarrel]

const designSystemPatterns = [
  {
    regex: '^~/design-system$',
    message: 'Import the file itself with ./, not through your own index.ts.',
  },
  {
    regex: '^(react-router(?:-dom)?|@react-router/[^/]+|~/[^/]+)($|/)',
    message: "The design system can't depend on the app. Pass what it needs as props.",
  },
]

// Colors come from tokens in app/design-system/theme/colors.ts.
const colorMessage =
  'Use a token from design-system/theme/colors.ts. A color that differs by theme gets a token.'
const hardCodedColor =
  '/(^|\\s)\\S*?dark:|\\b(bg|text|border|ring|outline|divide|from|via|to|accent|fill|stroke|caret|decoration|placeholder|shadow)-(white|black|(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]+)\\b/'

// Text sizes and weights come from the design system's Text component.
const rawTypography =
  /(^|\s)(?:\S*:)?!?(text-(xs|sm|base|lg|xl|[2-9]xl)|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black))!?(?=\s|$)/
const typographyPlugin = {
  rules: {
    'no-raw-typography': {
      meta: { type: 'suggestion', schema: [] },
      create(context) {
        const check = (node, text) => {
          if (typeof text === 'string' && rawTypography.test(text))
            context.report({
              node,
              message: 'Use Text from ~/design-system for type size and weight.',
            })
        }
        return {
          Literal: (node) => check(node, node.value),
          TemplateElement: (node) => check(node, node.value.raw),
        }
      },
    },
  },
}

export default defineConfig([
  globalIgnores([
    '**/build/',
    '**/dist/',
    '**/.react-router/',
    '**/storybook-static/',
    '**/.wrangler/',
    'worker-configuration.d.ts',
    '.claude/worktrees/',
  ]),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    plugins: { 'simple-import-sort': simpleImportSort, 'import-x': importX },
    settings: {
      // Without these, import-x skips TypeScript files when it follows imports.
      'import-x/extensions': ['.ts', '.tsx'],
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['tsconfig.app.json', 'tsconfig.worker.json', 'tsconfig.node.json'],
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: {
      // React Router loaders throw redirects and error responses.
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            { from: 'lib', name: 'Response' },
            { from: 'package', package: 'react-router', name: 'DataWithResponseInit' },
          ],
        },
      ],
      '@typescript-eslint/prefer-promise-reject-errors': ['error', { allowThrowingUnknown: true }],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000'], ['^@?\\w'], ['^~/'], ['^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',
      // Following packages' type files runs CI out of memory, and a cycle can't pass through them.
      'import-x/no-cycle': ['error', { ignoreExternal: true }],
      'import-x/no-self-import': 'error',
      'import-x/no-relative-packages': 'error',
      'import-x/no-default-export': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportAllDeclaration', message: 'List re-exports by name.' },
      ],
    },
  },

  // Config files and scripts that aren't part of a TypeScript project.
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Tools load these through a default export.
  {
    files: [
      '**/*.config.{ts,mjs}',
      'app/routes.ts',
      'app/root.tsx',
      'app/entry.server.tsx',
      'app/entry.client.tsx',
      'worker/index.ts',
      'app/routes/*.tsx',
      'app/design-system/theme/plugin.ts',
      'app/**/*.stories.tsx',
      '.storybook/**',
    ],
    rules: { 'import-x/no-default-export': 'off' },
  },

  // React.
  {
    files: ['**/*.tsx'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    settings: { react: { version: 'detect' } },
    rules: {
      'react/prop-types': 'off',
      // Quotes in text are fine; > and } are usually a typo.
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }],
    },
  },

  // Imports in app. No file may use a pattern here, including its own barrel.
  {
    files: ['app/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: appPatterns }],
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportAllDeclaration', message: 'List re-exports by name.' },
        { selector: `Literal[value=${hardCodedColor}]`, message: colorMessage },
        { selector: `TemplateElement[value.raw=${hardCodedColor}]`, message: colorMessage },
      ],
    },
  },
  ...barrels.map((folder) => ({
    files: [`app/${folder}/**`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...appPatterns,
            {
              regex: `^~/${folder.replace('.', '\\.')}$`,
              message: 'Import the file itself with ./, not through your own index.ts.',
            },
          ],
        },
      ],
    },
  })),

  // Text owns typography in pages and app components.
  {
    files: ['app/pages/**', 'app/components/**'],
    ignores: ['**/*.test.tsx'],
    plugins: { typography: typographyPlugin },
    rules: { 'typography/no-raw-typography': 'error' },
  },

  // Resolve relative imports too, so a design-system file cannot reach app code via ../.
  {
    files: ['app/design-system/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...appPatterns, ...designSystemPatterns] }],
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: import.meta.dirname,
          zones: [{ target: './app/design-system', from: './app', except: ['./design-system'] }],
        },
      ],
    },
  },

  // Pages take what they need as props, so stories can render them without a server or real routes.
  {
    files: ['app/pages/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...appPatterns,
            {
              regex: '^~/(\\.server|routes)($|[./])|^~/root($|[./])',
              message: 'Pages take what they need as props. Load it in the route.',
            },
            {
              group: ['react-router'],
              importNames: [
                'useNavigation',
                'useLoaderData',
                'useActionData',
                'useRouteLoaderData',
              ],
              message: 'Read this in the route and pass it to the page as a prop.',
            },
          ],
        },
      ],
    },
  },
])
