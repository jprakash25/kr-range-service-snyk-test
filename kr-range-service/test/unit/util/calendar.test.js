/* eslint-env jest */
const mockDate = require('mockdate')
const { getFinancialYear } = require('../../../src/util/calendar')

describe('Kmart FY calendar year', () => {
  it('should get KMart current financial year', () => {
    mockDate.set('2021-01-01')
    expect(getFinancialYear()).toBe(2021)
    mockDate.set('2021-06-30')
    expect(getFinancialYear()).toBe(2021)
    mockDate.set('2021-07-01')
    expect(getFinancialYear()).toBe(2022)
    mockDate.set('2021-12-31')
    expect(getFinancialYear()).toBe(2022)
  })
})
