/* eslint-env jest */
const Sequelize = require('sequelize')
const pg = require('pg')
const { getDB, dbInitialize, closeDB, pgConnect, pgClose } = require('../../../src/db')
const loggerService = require('../../../src/service/logger.service')

jest.mock('sequelize')
jest.mock('pg')
jest.mock('../../../src/service/logger.service')

describe('Unit::Config::Db', () => {

  beforeEach(() => {
    jest.resetModules()

  })

  describe('Unit::Config::Db', () => {
    beforeEach(() => {
      Sequelize.prototype.authenticate = jest.fn(() => Promise.resolve({ data: {} }))
    })
    test('should db instance to be define', () => {
      dbInitialize()
      expect(getDB()).toBeDefined()
    })

    test('should throw error', () => {
      try {
        Sequelize.prototype.authenticate = jest.fn(() => Promise.reject({ data: {} }))
        dbInitialize()
      } catch (err) {
        expect(err.message).toBe('error')
      }
    })

    test('should close db instance properly', () => {
      const db = closeDB()
      expect(db).toBeNull()
    })

    test('should close db instance properly', () => {
      const db = getDB()
      expect(db).toBeDefined()
    })
  })

  describe('Unit::Config::PGClient', () => {
    beforeEach(() => {
      pg.Client.prototype.connect = jest.fn(() => Promise.resolve({ data: {} }))
      pg.Client.prototype.end = jest.fn(() => Promise.resolve({ data: {} }))
    })

    test('should db instance to be define', async () => {
      const pgClient = await pgConnect()
      expect(pgClient).toBeDefined()
    })

    test('should db instance to be define', async () => {
      await pgConnect()
      pgClose()
    })
  })
})
