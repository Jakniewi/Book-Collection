// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|expo|@expo|react-native-safe-area-context|uuid|react-native-get-random-values)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.minimal.js'],
  collectCoverageFrom: [
    'src/models/**/*.{js,jsx}',
    'src/storage/**/*.{js,jsx}',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],
  testMatch: [
    '**/src/models/__tests__/**/*.test.js',
    '**/src/storage/__tests__/**/*.test.js'
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid')
  }
};