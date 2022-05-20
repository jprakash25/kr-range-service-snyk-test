/* eslint-env jest */
const routes = require('../../src/routes')

jest.mock('../../src/db')

describe('Unit::Routes', () => {
  it('should delcare routes', () => {
    expect(routes).toBeDefined()
  })
})
