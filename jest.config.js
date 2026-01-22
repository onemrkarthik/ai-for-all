/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  
  // Module path aliases (match tsconfig.json)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  
  // Test file patterns
  testMatch: [
    "<rootDir>/tests/**/*.test.ts",
    "<rootDir>/tests/**/*.test.tsx",
  ],
  
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
};
