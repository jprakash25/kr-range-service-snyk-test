/* eslint-env jest */
const productPropertyService = require('../../../src/service/productProperties.service')
const mockdate = require('mockdate')
const { getSampleCSVDataInputAndOutput } = require('../../fixtures/product-properties-data')

describe('Service:::Product Property', () => {
  describe('Method:::transformEventToModel_SheetUpload', () => {
    let sheetData, editableProperties
    beforeEach(() => {
      mockdate.set('2019-11-11')
      editableProperties = {
        'K hub Base': 1,
        'K hub Plus': 2,
        'K hub Minus': 3,
        'K hub Max': 4,
        'K hub On Range Date': 5,
        'K hub Off Range Date': 6
      }
      sheetData = getSampleCSVDataInputAndOutput()
    })

    afterAll(() => {
      mockdate.reset()
    })

    it('should return proper product property model with all the editable columns', async () => {
      expect(productPropertyService.transformEventToModel_SheetUpload(sheetData.input, editableProperties)).toEqual(sheetData.output)
    })

    it('should only contain data for properties present in editable properties', () => {
      editableProperties = {
        'K hub Base': 1,
        'K hub Plus': 2,
        'K hub Minus': 3
      }
      const expectedModel = [
        {
          productId: '849ddead6d344cc88969651f98a53ba7',
          sourceId: 'ITM1810-004204',
          propertyId: 1,
          propertyValue: 'y',
          createdAt: new Date(),
          updatedAt: new Date(),
          username: null
        },
        {
          productId: '849ddead6d344cc88969651f98a53ba7',
          sourceId: 'ITM1810-004204',
          propertyId: 2,
          propertyValue: 'y',
          createdAt: new Date(),
          updatedAt: new Date(),
          username: null
        },
        {
          productId: '849ddead6d344cc88969651f98a53ba7',
          sourceId: 'ITM1810-004204',
          propertyId: 3,
          propertyValue: 'n',
          createdAt: new Date(),
          updatedAt: new Date(),
          username: null
        }]
      expect(productPropertyService.transformEventToModel_SheetUpload(sheetData.input, editableProperties)).toEqual(expectedModel)
    })

    it('should return empty model if editable properties are not there', () => {
      editableProperties = {}
      expect(productPropertyService.transformEventToModel_SheetUpload(sheetData.input, editableProperties)).toEqual([])
    })
  })
})
