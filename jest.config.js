module.exports = {
    collectCoverageFrom: ['lib/**/*.js'],
    coverageDirectory: '<rootDir>/coverage/',
    coveragePathIgnorePatterns: ['node_modules'],
    coverageThreshold: {
        global: {
            statements: 3.3,
            branches: 0.5,
            functions: 0.7,
            lines: 3.3,
        },
    },
    testMatch: ['**/?(*.)+(spec|test).js'],
    testPathIgnorePatterns: ['node_modules'],
    silent: false,
}
