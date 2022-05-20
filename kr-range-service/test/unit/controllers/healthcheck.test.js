/* eslint-env jest */
const { healthcheck } = require('../../../src/controllers')

describe('Unit:::Health Check Controller', () => {
  let res; const req = {}
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('health check function', () => {
    it('should return healthy', (done) => {
      healthcheck.check()(req, res)
      done()
    })
  })
})
