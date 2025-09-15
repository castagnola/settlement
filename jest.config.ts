import type { Config } from "@jest/types";
const { COVERATGE_BRANCH, COVERATGE_FUNCTIONS, COVERATGE_LINES, COVERATGE_STATEMENTS } = process.env;

const config: Config.InitialOptions = {
  silent: true,
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["**/src/**/*.ts", "!**/src/**/*.type.ts", "!**/src/**/axios.ts", "!**/src/**/transaction.model.ts"],
  coverageReporters: ["html", "lcov", "text", "cobertura"],
  coverageDirectory: "./coverage",
  testPathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
  ],
  testMatch: ["**/src/**/?(*.)+(spec).(ts)"],
  testResultsProcessor: "jest-sonar-reporter",
  clearMocks: true,
  roots: ["<rootDir>/src/"],
  setupFiles: ["<rootDir>/.jest/setEnvVars.ts"],
  reporters: ["default", "jest-junit"],
  coverageThreshold: {
    global: {
      // branches: Number(COVERATGE_BRANCH) || 80,
      // functions: Number(COVERATGE_FUNCTIONS) || 80,
      // lines: Number(COVERATGE_LINES) || 80,
      // statements: Number(COVERATGE_STATEMENTS) || 80,
    },
  },
};

module.exports = config;
