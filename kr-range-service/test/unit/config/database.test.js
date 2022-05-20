/* eslint-env jest */
const dbConfig = require('../../../src/config/database')
describe('Unit::Config::Database', () => {
  beforeEach(() => jest.resetModules())

  describe('Unit::Config::Database::Success', () => {
    beforeEach(() => process.env.PG_CONFIG = JSON.stringify({ username: 'test1', password: 'test2' }))
    test('should delcare database config from ENV', () => {
      const config = dbConfig()
      expect(config.username).toBe('test1')
      expect(config.password).toBe('test2')
    })
  })

  describe('Unit::Config::Database::Error', () => {
    beforeEach(() => process.env.PG_CONFIG = 'string')
    test('should throw error', () => {
      expect(() => dbConfig()).toThrow()
    })
  })
})
