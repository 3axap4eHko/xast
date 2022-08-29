module.exports = {
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: !!process.env.CI,
  preset: 'ts-jest',
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '__fixtures__',
    '__mocks__',
    '__tests__',
  ],
  coverageDirectory: './coverage',
};
