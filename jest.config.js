/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  modulePathIgnorePatterns: [
        '<rootDir>/dist/',
    '<rootDir>/build/',
    ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: [
        'ts',
        'js',
        'json',
        'node',
    ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'json-summary',
    'text',
    'lcov',
  ],
};

module.exports = config;