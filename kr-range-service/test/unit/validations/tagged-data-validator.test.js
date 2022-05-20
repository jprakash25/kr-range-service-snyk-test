/* eslint-env jest */
const { csvValidation, dataValidation, onOffRangeDateValidation, validateMutualExclusiveness, addDataErrorWithMoreSpecifiers, identifyDuplicateRecords } = require('../../../src/lib/validations/tagged-data-validator')
const productInfoV2Repository = require('../../../src/lib/repositories/product-info-v2-repository')
const productPropertiesRepository = require('../../../src/lib/repositories/product-properties-repository')
const { customMessages } = require('../../../src/config/tagged-data')
jest.mock('../../../src/lib/repositories/product-info-v2-repository')
jest.mock('../../../src/lib/repositories/product-properties-repository')

describe('Tagged data validator', () => {
  describe('CSV Validation of tagged sheet', () => {
    it('all rows exist for khub', () => {
      const rowInfo = {
        'Department': '123',
        'Product Nbr': '456',
        'KHUB': '',
        'KHUB PLUS': '',
        'KHUB MINUS': '',
        'KHUB MAX': '',
        'KHUB SUPER MAXX': ''
      }
      const validation = csvValidation(rowInfo, 'khub')
      expect(validation.schemaError).toBe(undefined)
    })

    it('all rows exist for kmart', () => {
      const rowInfo = {
        'Department': '123',
        'Product Nbr': '456',
        'FLEET': '',
        'SMALL FLEET': '',
        'ONLINE': ''
      }
      const validation = csvValidation(rowInfo, 'kmart')
      expect(validation.schemaError).toBe(undefined)
    })

    it('Throw error on schema validation fail for khub', () => {
      const rowInfo = {
        'Department': '123',
        'Product Nbr': '456',
        'KHUB': 'A',
        'KHUB PLUS': 'B',
        'KHUB MINUS': 'C',
        'KHUB MAX': 'D',
        'KHUB SUPER MAXX': 'E'
      }
      const validation = csvValidation(rowInfo, 'khub')
      expect(validation.schemaError).not.toBe(undefined)
    })

    it('Throw Error when partial store formats are tagged for khub', () => {
      const rowInfo = {
        'Department': '123',
        'Product Nbr': '456',
        'KHUB': 'Y',
        'KHUB PLUS': 'N',
        'KHUB MINUS': '',
        'KHUB MAX': '',
        'KHUB SUPER MAXX': '',
        'Keycode': 12345
      }
      const validation = csvValidation(rowInfo, 'khub')
      expect(validation.schemaError).toBe('Keycode 12345: All store formats should be tagged or all should be empty')
    })

    it('Throw Error when partial store formats are tagged for kmart', () => {
      const rowInfo = {
        'Department': '123',
        'Product Nbr': '456',
        'FLEET': 'Y',
        'SMALL FLEET': '',
        'ONLINE': '',
        'Keycode': 12345
      }
      const validation = csvValidation(rowInfo, 'kmart')
      expect(validation.schemaError).toBe('Keycode 12345: All store formats should be tagged or all should be empty')
    })

    it('Throw Error when Department is empty', () => {
      const rowInfo = {
        'Department': '',
        'Product Nbr': '456',
        'FLEET': 'Y',
        'SMALL FLEET': 'N',
        'ONLINE': 'Y',
        'Kmart Style ID': 12345
      }
      const validation = csvValidation(rowInfo, 'kmart')
      expect(validation.schemaError).toBe('Kmart Style ID 12345: \"Department\" is not allowed to be empty')
    })

  })

  describe('Data Validation of tagged sheet', () => {
    let product
    let rowInfo
    let userAssociatedDepartments
    beforeEach(() => {
      rowInfo = {
        'Keycode': '12345'
      }
      product = {
        productId: '123',
        sourceId: '456',
        isRegistered: false,
        productData: {
          familyTree: {
            department: {
              code: '032'
            }
          }
        }
      },
        userAssociatedDepartments = {
          departments: [
            '032',
            '033'
          ]
        }
    })

    it('throw error when both Kmart Style ID and Keycode are empty', async () => {
      rowInfo = {}
      const validation = await dataValidation(rowInfo, userAssociatedDepartments)
      expect(validation.dataError).toBe('Kmart Style ID undefined : Ensure to provide value for all the required columns')
    })

    it('throw error when Secondary Color is empty for Kmart Style ID', async () => {
      rowInfo = {
        'Kmart Style ID': '12345',
        'Primary Color': 'Black'
      }
      const validation = await dataValidation(rowInfo, userAssociatedDepartments)
      expect(validation.dataError).toBe('Kmart Style ID 12345 : Ensure to provide value for all the required columns')
    })

    it('throw error when Primary Color is empty for Kmart Style ID', async () => {
      rowInfo = {
        'Kmart Style ID': '12345',
        'Secondary Color': 'Black'
      }
      const validation = await dataValidation(rowInfo, userAssociatedDepartments)
      expect(validation.dataError).toBe('Kmart Style ID 12345 : Ensure to provide value for all the required columns')
    })

    it('throw error if product is not registered', async () => {
      productInfoV2Repository.findProductBy.mockImplementation(() => {
        return Promise.resolve(product)
      })
      const validation = await dataValidation(rowInfo, userAssociatedDepartments)
      expect(validation.dataError).toBe('Keycode 12345 : The product is not a registered product')
    })

    it('throw error if product is not found', async () => {
      rowInfo = {
        'Kmart Style ID': '12345',
        'Primary Color': 'Black',
        'Secondary Color': 'Red'
      }
      product = undefined
      productInfoV2Repository.findProductBy.mockImplementation(() => {
        return Promise.resolve(product)
      })
      const validation = await dataValidation(rowInfo, userAssociatedDepartments)
      expect(validation.dataError).toBe('Kmart Style ID 12345, Primary Color Black, Secondary Color Red : No record found with a combination of these style id, primary or secondary color. If it does, please also verify correct spacing')
    })

    it('resolve row if product data is valid', async () => {
      product.isRegistered = true
      productInfoV2Repository.findProductBy.mockImplementation(() => {
        return Promise.resolve(product)
      })
      const validation = await dataValidation(rowInfo, userAssociatedDepartments)
      expect(validation.dataError).toBe(undefined)
    })
  })

  describe('Validate mutual exclusiveness', () => {
    let row
    let errorList
    let passFailedRows
    let column1
    let column2

    beforeEach(() => {
      errorList = []
      passFailedRows = {
        fail: 0
      }
      row = {
        'Keycode': 12345,
        'Kmart Style ID': 98765
      }
      column1 = ['Kmart Style ID']
      column2 = ['Keycode']
    })

    it('should return false when both Keycode and Kmart Style ID values are provided', () => {
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows, customMessages.customMessage1)
      expect(result).toBe(false)
      expect(passFailedRows.fail).toBe(1)
      expect(errorList[0].dataError).toBe(`Keycode 12345 : Kmart Style ID and Keycode are mutually exclusive column items.${customMessages.customMessage1}`)
    })

    it('should return true when either of Keycode or Kmart Style ID value is provided', () => {
      row['Kmart Style ID'] = ''
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
    })

    it('should return true when either of Keycode or Kmart Style ID value is provided', () => {
      row['Keycode'] = ''
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
    })

    it('should return false when both On range date and Northern On range date are provided', () => {
      column1 = ['KHUB ON RANGE DATE']
      column2 = ['KHUB NORTHERN ON RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES']
      row = {
        'KHUB ON RANGE DATE': 'PD03WK05F22',
        'KHUB NORTHERN ON RANGE DATES': 'PD03WK05F22',
        'KHUB SOUTHERN ON RANGE DATES': '',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(false)
      expect(passFailedRows.fail).toBe(1)
      expect(errorList[0].dataError).toBe('Keycode 12345 : KHUB ON RANGE DATE and KHUB NORTHERN ON RANGE DATES/KHUB SOUTHERN ON RANGE DATES are mutually exclusive column items')
    })

    it('should return false when both On range date and Southern On range date are provided', () => {
      column1 = ['KHUB ON RANGE DATE']
      column2 = ['KHUB NORTHERN ON RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES']
      row = {
        'KHUB ON RANGE DATE': 'PD03WK05F22',
        'KHUB NORTHERN ON RANGE DATES': '',
        'KHUB SOUTHERN ON RANGE DATES': 'PD03WK05F22',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(false)
      expect(passFailedRows.fail).toBe(1)
      expect(errorList[0].dataError).toBe('Keycode 12345 : KHUB ON RANGE DATE and KHUB NORTHERN ON RANGE DATES/KHUB SOUTHERN ON RANGE DATES are mutually exclusive column items')
    })

    it('should return false when both Off range date and Northern Off range date are provided', () => {
      column1 = ['KHUB OFF RANGE DATE']
      column2 = ['KHUB NORTHERN OFF RANGE DATES', 'KHUB SOUTHERN OFF RANGE DATES']
      row = {
        'KHUB OFF RANGE DATE': 'PD03WK05F22',
        'KHUB NORTHERN OFF RANGE DATES': 'PD03WK05F22',
        'KHUB SOUTHERN OFF RANGE DATES': '',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(false)
      expect(passFailedRows.fail).toBe(1)
      expect(errorList[0].dataError).toBe('Keycode 12345 : KHUB OFF RANGE DATE and KHUB NORTHERN OFF RANGE DATES/KHUB SOUTHERN OFF RANGE DATES are mutually exclusive column items')
    })

    it('should return false when both Off range date and Southern Off range date are provided', () => {
      column1 = ['KHUB OFF RANGE DATE']
      column2 = ['KHUB NORTHERN OFF RANGE DATES', 'KHUB SOUTHERN OFF RANGE DATES']
      row = {
        'KHUB OFF RANGE DATE': 'PD03WK05F22',
        'KHUB NORTHERN OFF RANGE DATES': '',
        'KHUB SOUTHERN OFF RANGE DATES': 'PD03WK05F22',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(false)
      expect(passFailedRows.fail).toBe(1)
      expect(errorList[0].dataError).toBe('Keycode 12345 : KHUB OFF RANGE DATE and KHUB NORTHERN OFF RANGE DATES/KHUB SOUTHERN OFF RANGE DATES are mutually exclusive column items')
    })

    it('should return true when either of Off range date or Southern Off range date is provided', () => {
      column1 = ['KHUB OFF RANGE DATE']
      column2 = ['KHUB NORTHERN OFF RANGE DATES', 'KHUB SOUTHERN OFF RANGE DATES']
      row = {
        'KHUB OFF RANGE DATE': '',
        'KHUB NORTHERN OFF RANGE DATES': 'PD03WK05F22',
        'KHUB SOUTHERN OFF RANGE DATES': 'PD03WK05F22',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
      expect(passFailedRows.fail).toBe(0)
    })

    it('should return true when either of On range date or Southern On range date is provided', () => {
      column1 = ['KHUB ON RANGE DATE']
      column2 = ['KHUB NORTHERN ON RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES']
      row = {
        'KHUB ON RANGE DATE': '',
        'KHUB NORTHERN ON RANGE DATES': 'PD03WK05F22',
        'KHUB SOUTHERN ON RANGE DATES': 'PD03WK05F22',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
      expect(passFailedRows.fail).toBe(0)
    })

    it('should return true when either of On range date or Southern On range date is provided', () => {
      column1 = ['KHUB ON RANGE DATE']
      column2 = ['KHUB NORTHERN ON RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES']
      row = {
        'KHUB ON RANGE DATE': '',
        'KHUB SOUTHERN ON RANGE DATES': '',
        'KHUB NORTHERN ON RANGE DATES': '',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
      expect(passFailedRows.fail).toBe(0)
    })

    it('should return true when all dates are empty', () => {
      column1 = ['OFF RANGE DATE']
      column2 = ['NORTHERN OFF RANGE DATES', 'SOUTHERN OFF RANGE DATES']
      row = {
        'OFF RANGE DATE': '',
        'SOUTHERN OFF RANGE DATES': '',
        'NORTHERN OFF RANGE DATES': '',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
      expect(passFailedRows.fail).toBe(0)
    })

    it('should return true when either of On range date or Southern On range date is provided', () => {
      column1 = ['ON RANGE DATE']
      column2 = ['NORTHERN ON RANGE DATES', 'SOUTHERN ON RANGE DATES']
      row = {
        'ON RANGE DATE': '',
        'SOUTHERN ON RANGE DATES': 'PD03WK05F22',
        'NORTHERN ON RANGE DATES': '',
        'Keycode': 12345
      }
      const result = validateMutualExclusiveness(row, column1, column2, errorList, passFailedRows)
      expect(result).toBe(true)
      expect(passFailedRows.fail).toBe(0)
    })
  })

  describe('On and Off Range date validations', () => {
    let row
    let periodData = [{
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
    let channel
    let northernSouthernRanges
    let kmartRangeProperties = [{
      id: '1',
      name: 'NORTHERN ON RANGE DATES'
    },
    {
      id: '2',
      name: 'NORTHERN OFF RANGE DATES'
    },
    {
      id: '3',
      name: 'SOUTHERN ON RANGE DATES'
    },
    {
      id: '4',
      name: 'SOUTHERN OFF RANGE DATES'
    }]
    let propertyIdList = ['1', '2', '3', '4']
    let rangeProperties = [
      {
        id: '1',
        productId: '123',
        sourceId: '456',
        propertyId: '1',
        propertyValue: 'PD05WK02F21'
      },
      {
        id: '1210',
        productId: '123',
        sourceId: '456',
        propertyId: '2',
        propertyValue: 'PD05WK02F21'
      },
      {
        id: '1211',
        productId: '123',
        sourceId: '456',
        propertyId: '3',
        propertyValue: 'PD05WK02F21'
      },
      {
        id: '1212',
        productId: '123',
        sourceId: '456',
        propertyId: '4',
        propertyValue: 'PD05WK02F21'
      }
    ]

    beforeEach(() => {
      row = {
        'KHUB ON RANGE DATE': 'PD05WK01F21',
        'KHUB OFF RANGE DATE': 'PD05WK02F21',
        'FLEET ON RANGE': '31/12/2019',
        'FLEET OFF RANGE': '31/12/2021',
        'KHUB NORTHERN ON RANGE DATES': '',
        'KHUB NORTHERN OFF RANGE DATES': '',
        'KHUB SOUTHERN ON RANGE DATES': '',
        'KHUB SOUTHERN OFF RANGE DATES': '',
        'Keycode': '12345'
      }

      northernSouthernRanges = {
        'NORTHERN ON RANGE DATES': 'PD05WK01F21',
        'NORTHERN OFF RANGE DATES': 'PD05WK02F21',
        'SOUTHERN ON RANGE DATES': 'PD05WK01F21',
        'SOUTHERN OFF RANGE DATES': 'PD05WK02F21',
        'Keycode': '12345'
      }

      channel = 'khub'

      productPropertiesRepository.getProductProperties.mockImplementation(() => {
        return Promise.resolve(rangeProperties)
      })
    })

    it('there should not be any data error if valid periods are provided', async () => {
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('there should not be any data error if valid period is provided', async () => {
      row['KHUB OFF RANGE DATE'] = ''
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('it should add an error if period format is not provided for on range', async () => {
      row['KHUB ON RANGE DATE'] = '31/12/9999'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : KHUB ON RANGE DATE doesn\'t have a proper date specified')
    })

    it('it should add an error if period format is not provided for off range', async () => {
      row['KHUB OFF RANGE DATE'] = '31/12/9999'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : KHUB OFF RANGE DATE doesn\'t have a proper date specified')
    })

    it('it should add an error if on range period is not less than off range period', async () => {
      row['KHUB ON RANGE DATE'] = 'PD12WK02F21'
      row['KHUB OFF RANGE DATE'] = 'PD05WK01F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : On range date is not less than Off range date')
    })

    it('it should add an error if on range period is not between fleet on/off range period', async () => {
      row['FLEET ON RANGE'] = '31/12/2020'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : On Range date does not fall between fleet on and off range dates, Off Range date does not fall between fleet on and off range dates')
    })

    it('it should add an error if off range period is not between fleet on/off range period', async () => {
      row['FLEET OFF RANGE'] = '01/11/2020'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Off Range date does not fall between fleet on and off range dates')
    })

    it('there should not be any data error if valid periods are provided for northern/southern ranges', async () => {
      channel = 'kmart'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('it should add an error if period format is not provided for northern on range', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['NORTHERN ON RANGE DATES'] = '31/12/9999'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : NORTHERN ON RANGE DATES doesn\'t have a proper date specified')
    })

    it('it should add an error if period format is not provided for northern off range', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['NORTHERN OFF RANGE DATES'] = '31/12/9999'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : NORTHERN OFF RANGE DATES doesn\'t have a proper date specified')
    })

    it('it should add an error if period format is not provided for souther off range', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['SOUTHERN OFF RANGE DATES'] = '31/12/9999'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : SOUTHERN OFF RANGE DATES doesn\'t have a proper date specified')
    })

    it('it should add an error if period format is not provided for southern on range', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['SOUTHERN ON RANGE DATES'] = '31/12/9999'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : SOUTHERN ON RANGE DATES doesn\'t have a proper date specified')
    })

    it('it should add an error if northern on range date is not less than northern off range date', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['NORTHERN ON RANGE DATES'] = 'PD12WK01F21'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Northern On range date is not less than Northern Off range date')
    })

    it('it should not add an error if northern on range date is equal to northern off range date', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['NORTHERN ON RANGE DATES'] = 'PD05WK02F21'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('it should add an error if southern on range date is not less than southern off range date', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['SOUTHERN ON RANGE DATES'] = 'PD12WK01F21'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Southern On range date is not less than Southern Off range date')
    })

    it('it should not add an error if northern on range date is equal to northern off range date', async () => {
      channel = 'kmart'
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      northernSouthernRanges['SOUTHERN ON RANGE DATES'] = 'PD05WK02F21'
      const result = await onOffRangeDateValidation(northernSouthernRanges, periodData, channel)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('it should take kmart (fleet) northern on range date when khub northern on range date is empty', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
      expect(result['KHUB NORTHERN ON RANGE DATES']).toEqual('PD05WK02F21')
    })

    it('it should take kmart (fleet) northern off range date when khub northern off range date is empty', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
      expect(result['KHUB NORTHERN OFF RANGE DATES']).toEqual('PD05WK02F21')
    })

    it('it should take kmart (fleet) southern on range date when khub southern on range date is empty', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
      expect(result['KHUB SOUTHERN ON RANGE DATES']).toEqual('PD05WK02F21')
    })

    it('it should take kmart (fleet) southern off range date when khub southern off range date is empty', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
      expect(result['KHUB SOUTHERN OFF RANGE DATES']).toEqual('PD05WK02F21')
    })

    it('it should return error when northern on range date is less than kmart northern on range date', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB NORTHERN ON RANGE DATES'] = 'PD05WK01F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Northern On range date is not equal or greater than Kmart (fleet) Northern On range date')
    })

    it('it should return error when northern off range date is greater than kmart northern off range date', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB NORTHERN OFF RANGE DATES'] = 'PD12WK01F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Northern Off range date is not equal or earlier than Kmart (fleet) Northern Off range date')
    })

    it('it should return error when southern on range date is less than kmart southern on range date', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB SOUTHERN ON RANGE DATES'] = 'PD05WK01F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Southern On range date is not equal or greater than Kmart (fleet) Southern On range date')
    })

    it('it should return error when southern off range date is greater than kmart southern off range date', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB SOUTHERN OFF RANGE DATES'] = 'PD12WK01F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Southern Off range date is not equal or earlier than Kmart (fleet) Southern Off range date')
    })

    it('it should return error when both northern and southern off range date is greater than kmart northern southern off range date', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB SOUTHERN OFF RANGE DATES'] = 'PD12WK01F21'
      row['KHUB NORTHERN OFF RANGE DATES'] = 'PD12WK01F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : Northern Off range date is not equal or earlier than Kmart (fleet) Northern Off range date, Southern Off range date is not equal or earlier than Kmart (fleet) Southern Off range date')
    })

    it('it should return no error when all are valid', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB SOUTHERN ON RANGE DATES'] = 'PD05WK02F21'
      row['KHUB SOUTHERN OFF RANGE DATES'] = 'PD05WK02F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('it should return no error when all are valid', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB NORTHERN ON RANGE DATES'] = 'PD05WK02F21'
      row['KHUB SOUTHERN OFF RANGE DATES'] = 'PD05WK02F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })

    it('it should return no error when all are valid', async () => {
      row['KHUB ON RANGE DATE'] = ''
      row['KHUB OFF RANGE DATE'] = ''
      row['KHUB NORTHERN ON RANGE DATES'] = 'PD05WK02F21'
      row['KHUB NORTHERN OFF RANGE DATES'] = 'PD05WK02F21'
      const result = await onOffRangeDateValidation(row, periodData, channel, propertyIdList, kmartRangeProperties)
      expect(result.hasOwnProperty('dataError')).toBe(false)
    })
  })

  describe('Identify duplicate records', () => {
    let row = {
      Keycode: 12345
    }
    let duplicateRowsHashMap = {
      '12345': 1
    }

    it('it should add duplicate error for Keycode', () => {
      const result = identifyDuplicateRecords(row, duplicateRowsHashMap)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Keycode 12345 : appears more than once. Please remove duplicate row(s)')
      expect(duplicateRowsHashMap.hasOwnProperty('12345')).toBe(true)
      expect(duplicateRowsHashMap['12345']).toBe(2)
    })

    it('it should add duplicate error for Style ID, Primary Color, Secondary Color', () => {
      row = {
        'Kmart Style ID': 12345,
        'Primary Color': 'Red',
        'Secondary Color': 'Blue'
      }
      duplicateRowsHashMap = {
        '12345RedBlue': 1
      }
      const result = identifyDuplicateRecords(row, duplicateRowsHashMap)
      expect(result.hasOwnProperty('dataError')).toBe(true)
      expect(result.dataError).toEqual('Kmart Style ID 12345, Primary Color Red, Secondary Color Blue : appears more than once. Please remove duplicate row(s)')
      expect(duplicateRowsHashMap['12345RedBlue']).toBe(2)
    })

    it('no duplicates identified if hash is empty', () => {
      row = {
        'Kmart Style ID': 12345,
        'Primary Color': 'Red',
        'Secondary Color': 'Blue'
      }
      duplicateRowsHashMap = {}
      const result = identifyDuplicateRecords(row, duplicateRowsHashMap)
      expect(result.hasOwnProperty('dataError')).toBe(false)
      expect(duplicateRowsHashMap.hasOwnProperty('12345RedBlue')).toBe(true)
      expect(duplicateRowsHashMap['12345RedBlue']).toBe(1)
    })
  })

  describe('Add duplicate error', () => {
    let row = {
      Keycode: 12345
    }

    it('it should add an error for Keycode', () => {
      const result = addDataErrorWithMoreSpecifiers(row, 'appears more than once. Please remove duplicate row(s)')
      expect(result).toEqual('Keycode 12345 : appears more than once. Please remove duplicate row(s)')
    })

    it('it should add an error for Keycode', () => {
      row = {
        'Kmart Style ID': 12345,
        'Primary Color': 'Red',
        'Secondary Color': 'Blue'
      }
      const result = addDataErrorWithMoreSpecifiers(row, 'appears more than once. Please remove duplicate row(s)')
      expect(result).toEqual('Kmart Style ID 12345, Primary Color Red, Secondary Color Blue : appears more than once. Please remove duplicate row(s)')
    })
  })
})
