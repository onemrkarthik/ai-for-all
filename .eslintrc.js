// @ts-check

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'boundaries',
    'import',
  ],
  settings: {
    // Define architectural layers and features
    'boundaries/elements': [
      // Feature-specific interface components (isolated from each other)
      { 
        type: 'feature-interface', 
        pattern: ['app/(routes|pages)/*/**', 'app/professionals/**', 'app/photos/**', 'app/styles/**'],
        capture: ['feature'],
      },
      // Feature-specific API routes (isolated from each other)
      { 
        type: 'feature-api', 
        pattern: ['app/api/*/**'],
        capture: ['feature'],
      },
      // Shared UI components (can be used by any feature)
      { 
        type: 'shared-components', 
        pattern: ['app/components/*'],
      },
      // Shared layout and pages at app root
      { 
        type: 'app-root', 
        pattern: ['app/layout.tsx', 'app/page.tsx', 'app/loading.tsx', 'app/error.tsx'],
      },
      // Logic layer
      { 
        type: 'logic', 
        pattern: ['lib/api/*', 'lib/navigation/*', 'lib/services/*'],
        capture: ['module'],
      },
      // Data layer
      { 
        type: 'data', 
        pattern: ['lib/db/*'],
        capture: ['module'],
      },
      // Shared utilities
      {
        type: 'shared',
        pattern: ['lib/*'],
        capture: ['module'],
      },
    ],
    'boundaries/ignore': [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    // ==========================================
    // LAYER ENFORCEMENT
    // ==========================================
    
    'boundaries/element-types': [
      'error',
      {
        default: 'allow',
        rules: [
          // Interface layer cannot import data layer directly
          {
            from: ['feature-interface', 'feature-api', 'shared-components'],
            disallow: ['data'],
            message: 'UI/API routes cannot import from lib/db directly. Use a service layer.',
          },
          // FEATURE ISOLATION: Features cannot import from other features
          {
            from: ['feature-interface'],
            disallow: ['feature-interface'],
            message: 'Features cannot import from other features directly. Extract shared code to app/components/ or lib/.',
          },
          {
            from: ['feature-api'],
            disallow: ['feature-api'],
            message: 'API routes cannot import from other API routes. Extract shared code to lib/services/.',
          },
          // Features can only use shared components, not each other's components
          {
            from: ['feature-interface', 'feature-api'],
            allow: ['shared-components', 'shared', 'logic'],
            disallowMessage: 'Features must use shared components from app/components/ or lib/, not from other features.',
          },
        ],
      },
    ],

    // Prevent importing from restricted paths
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/lib/db/**'],
            importNames: ['db', 'database'],
            message: 'Do not import db directly in components. Use services instead.',
          },
          // Prevent cross-feature imports within app/
          {
            group: ['**/app/professionals/**'],
            message: 'Do not import from professionals feature directly. Use shared components or lib/.',
          },
          {
            group: ['**/app/photos/**'],
            message: 'Do not import from photos feature directly. Use shared components or lib/.',
          },
          {
            group: ['**/app/styles/**'],
            message: 'Do not import from styles feature directly. Use shared components or lib/.',
          },
          {
            group: ['**/app/api/**'],
            message: 'Do not import from API routes directly. Use lib/api client instead.',
          },
          // Relative imports that cross feature boundaries
          {
            group: ['../**/professionals/**', '../**/photos/**', '../**/styles/**'],
            message: 'Cross-feature imports are forbidden. Extract shared code to app/components/ or lib/.',
          },
        ],
        paths: [
          {
            name: 'better-sqlite3',
            message: 'Do not import better-sqlite3 directly. Use lib/db instead.',
          },
        ],
      },
    ],

    // ==========================================
    // NAMING ENFORCEMENT
    // ==========================================

    // Enforce consistent file naming (kebab-case or PascalCase for components)
    // Note: This is enforced by check-standards.ts script

    // Prevent default exports (encourages explicit naming)
    'import/no-default-export': 'off', // Next.js requires default exports for pages

    // Enforce named exports for non-page files
    'import/prefer-default-export': 'off',

    // ==========================================
    // CODE QUALITY
    // ==========================================

    // No any type
    '@typescript-eslint/no-explicit-any': 'error',

    // Require return types on functions
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
      },
    ],

    // Require types for function parameters
    '@typescript-eslint/explicit-module-boundary-types': 'warn',

    // No unused variables
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // Consistent type imports
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],

    // ==========================================
    // IMPORT ORGANIZATION
    // ==========================================

    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'type',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],

    // No circular dependencies
    'import/no-cycle': 'error',

    // ==========================================
    // REACT/NEXT.JS SPECIFIC
    // ==========================================

    // Enforce 'use client' consistency
    'react/function-component-definition': [
      'warn',
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],
  },
  overrides: [
    // Allow default exports in Next.js pages and API routes
    {
      files: [
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx',
        'app/api/**/*.ts',
      ],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    // Allow any in test files
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
