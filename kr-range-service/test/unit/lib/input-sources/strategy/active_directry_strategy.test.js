const { getStrategy } = require('../../../../../src/lib/input-sources/strategy/active_directry_strategy')

describe('Azure Bearer Strategy test', () => {

  it('If product properties for a product does not exists', async () => {
    let strategy = getStrategy()
    expect(strategy.name).toBe("oauth-bearer")
  })
})
