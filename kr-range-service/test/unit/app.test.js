/* eslint-env jest */
const { init } = require('../../src/app')
const { dbInitialize } = require('../../src/db')
jest.mock('../../src/db')
jest.mock('../../src/startup')

describe('Unit::App', () => {
  it('should delcare app', () => {
    expect(init()).toBeDefined()
  })

  describe('Unit::App::Error', () => {
    it('should throw err', async () => {
      dbInitialize.mockRejectedValue(new Error('Async error'))
      expect(init()).rejects.toThrow(new Error('Error: Async error'))
    })
  })
})
