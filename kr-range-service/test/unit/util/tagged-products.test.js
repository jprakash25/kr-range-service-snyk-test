/* eslint-env jest */
const { getProductFilters, getYearList } = require('../../../src/util/tagged-products')

describe('Tagged Products', () => {

  describe('get product filters', () => {

    it('should return filters', () => {
      let filters = {
        rbu_department_mapping: ['001'],
        year: ['2020', '2021'],
        season: ['Non-Seasonal']
      }
      let searchText = 'abc'
      let expectedFilters = "is_valid_product = true AND department_code IN ('001') AND year IN (2020, 2021)  AND season IN ('Non-Seasonal') "
      let result = getProductFilters({ filters, searchText })
      expect(result).toEqual(expectedFilters)
    })
  })

  describe('get year list', () => {

    it('should return filters', () => {
      let result = getYearList(2020, 2023)
      expect(result).toEqual([2023, 2022, 2021, 2020])
    })
  })
})
