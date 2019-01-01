module.exports = {
    collectCoverageFrom: ['lib/**/*.ts'],
    coverageDirectory: '<rootDir>/coverage/',
    coveragePathIgnorePatterns: ['node_modules'],
    coverageThreshold: {
        global: {
            statements: 3,
            branches: 0.3,
            functions: 0.5,
            lines: 3,
        },
    },
    preset: 'ts-jest',
    testMatch: ['**/?(*.)+(spec|test).ts'],
    testPathIgnorePatterns: ['node_modules'],
    testEnvironment: 'node',
    verbose: true,
}
