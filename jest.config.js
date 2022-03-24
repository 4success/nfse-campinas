module.exports = {
    'preset': 'ts-jest',
    'testEnvironment': 'node',
    'modulePathIgnorePatterns': [
        '<rootDir>/dist/',
    ],
    'testRegex': '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    'moduleFileExtensions': [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
};