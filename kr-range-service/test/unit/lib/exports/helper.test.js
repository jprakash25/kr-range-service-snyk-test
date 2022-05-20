const { extractRangeDataProperties, extractPeriodCalendar, addAdditionalFields, extractProductStatus } = require('../../../../src/lib/exports/helper')
const { getProductProperties } = require('../../../../src/lib/repositories/product-properties-repository')
const { getPeriodCalendar } = require('../../../../src/lib/repositories/period-calendar-repository')
const { getPeriodStartDate } = require('../../../../src/util/calendar')

jest.mock('../../../../src/lib/repositories/product-properties-repository')
jest.mock('../../../../src/lib/repositories/export-report-metadata-repository')
jest.mock('../../../../src/lib/repositories/period-calendar-repository')
jest.mock('../../../../src/util/calendar')

describe('Export helper', () => {
  describe('Extract Range Data Properties', () => {
    let products
    let rangeProperties
    beforeEach(() => {
      products = [{
        id: '1a',
        product_id: 'abc',
        source_id: 'xyz'
      }, {
        id: '2b',
        product_id: 'def',
        source_id: 'xyz'
      }]

      rangeProperties = [
        { id: 1, name: 'K hub Base' },
        { id: 2, name: 'K hub Plus' },
        { id: 3, name: 'K hub Minus' }
      ]

      getProductProperties.mockImplementation(() => {
        const rangeProperties = [{
          productId: 'abc',
          sourceId: 'xyz',
          propertyId: 1,
          propertyValue: 'Y'
        }, {
          productId: 'def',
          sourceId: 'xyz',
          propertyId: 3,
          propertyValue: 'N'
        }]
        return Promise.resolve(rangeProperties)
      })
    })
    it('If product properties for a product exists', async () => {
      const result = await extractRangeDataProperties(products, rangeProperties)
      expect(result[0]).toHaveProperty('range_data')
      expect(result[0]?.range_data).toHaveProperty('K hub Base')
      expect(result[0]?.range_data['K hub Base']).toEqual('Y')
      expect(result[0]?.range_data).not.toHaveProperty('K hub Plus')
      expect(result[0]?.range_data).not.toHaveProperty('K hub Minus')

      expect(result[1]).toHaveProperty('range_data')
      expect(result[1]?.range_data).toHaveProperty('K hub Minus')
      expect(result[1]?.range_data['K hub Minus']).toEqual('N')
      expect(result[1]?.range_data).not.toHaveProperty('K hub Plus')
      expect(result[1]?.range_data).not.toHaveProperty('K hub Base')
    })

    it('If product properties for a product does not exists', async () => {
      products[0].product_id = 'asd'
      const result = await extractRangeDataProperties(products, rangeProperties)
      expect(result[0]?.range_data).not.toHaveProperty('K hub Base')
      expect(result[0]?.range_data).not.toHaveProperty('K hub Plus')
    })
  })

  describe('Extract range properties', () => {

    it('If period calendar is not empty', async () => {
      getPeriodCalendar.mockImplementation(() => {
        const periodList = [{
          'start_week_date': '01/11/2020',
          'end_week_date': '07/11/2020',
          'period': 'PD05WK01F21'
        },
        {
          'start_week_date': '08/11/2020',
          'end_week_date': '14/11/2020',
          'period': 'PD05WK02F21'
        },
        {
          'start_week_date': '01/06/2021',
          'end_week_date': '07/06/2021',
          'period': 'PD12WK01F21'
        },
        {
          'start_week_date': '08/06/2021',
          'end_week_date': '14/06/2021',
          'period': 'PD12WK02F21'
        }]
        return Promise.resolve(periodList)
      })

      const result = await extractPeriodCalendar()
      expect(result.length).toEqual(4)
    })

    it('Fetch period calendar from memoizee', async () => {
      getPeriodCalendar.mockImplementation(() => {
        return Promise.resolve([])
      })

      const result = await extractPeriodCalendar()
      expect(result.length).toEqual(4)
    })
  })

  describe('Add additional fields', () => {
    let params

    beforeEach(() => {
      params = {
        channel: 'khub',
        periodList: {
          periodCalendar: []
        },
        data: [{
          range_data: {}
        }, {
          range_data: {}
        }]
      }
      getPeriodStartDate.mockImplementation(() => {
        return '31/01/2022'
      })
    })

    it('If channel is khub', () => {
      const result = addAdditionalFields(params)
      expect(Object.keys(result[0]).length).toEqual(7)
    })

    it('If channel is kmart', () => {
      params.channel = 'kmart'
      const result = addAdditionalFields(params)
      expect(Object.keys(result[0]).length).toEqual(7)
    })
  })

  describe('Extract product status', () => {

    it('If status codes are empty', () => {
      const result = extractProductStatus([])
      expect(result).toEqual('')
    })

    it('If status codes length is one', () => {
      const result = extractProductStatus([3, 3])
      expect(result).toEqual(3)
    })

    it('If status codes are of equal occurrence', () => {
      const result = extractProductStatus([3, 3, 8, 8])
      expect(result).toEqual('')
    })

    it('If status codes are of unequal occurrence', () => {
      const result = extractProductStatus([3, 8, 8, 8])
      expect(result).toEqual('8')
    })
  })
})
