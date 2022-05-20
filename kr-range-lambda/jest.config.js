module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
    '<rootDir>/index.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/build/'
  ],
  resetMocks: true
}
