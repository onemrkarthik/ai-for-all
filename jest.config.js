/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  // Common transform configuration
  transform: {
    ...tsJestTransformCfg,
  },
  
  // Module path aliases (match tsconfig.json)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "app/**/*.{ts,tsx}",
    "!lib/db/schema.ts",        // Schema definitions only
    "!**/*.d.ts",               // Type declarations
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },

  // Use projects to handle different test environments
  projects: [
    // Unit tests for API routes and services (Node.js environment)
    {
      displayName: "unit",
      testEnvironment: "node",
      transform: {
        ...tsJestTransformCfg,
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "<rootDir>/tests/lib/**/*.test.ts",
        "<rootDir>/tests/app/api/**/*.test.ts",
      ],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    },
    // Component tests (jsdom environment)
    {
      displayName: "component",
      testEnvironment: "jsdom",
      transform: {
        ...tsJestTransformCfg,
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "<rootDir>/tests/app/components/**/*.test.tsx",
      ],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.tsx"],
    },
    // Architecture tests (Node.js environment)
    {
      displayName: "architecture",
      testEnvironment: "node",
      transform: {
        ...tsJestTransformCfg,
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      testMatch: [
        "<rootDir>/tests/architecture.test.ts",
      ],
    },
  ],
};
