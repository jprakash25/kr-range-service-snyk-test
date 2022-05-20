module.exports = {
  resetMocks: true,
  verbose: true,
  coveragePathIgnorePatterns: [
    '/build/',
    '/docs/',
    '/jest/',
    '/mock-data/',
    '/node_modules/',
    '/src/lib/repositories/',
    '/src/lib/models/'
  ],
  collectCoverageFrom: [
    'src/**/*.js'
  ],
  coverageReporters: [
    'lcovonly',
    'html',
    'text',
    'json',
    'json-summary'
  ],
  coverageDirectory: process.env.COVERAGE_DIR,
  testEnvironment: 'node',
  moduleDirectories: [
    'node_modules',
    '.'
  ]
}
