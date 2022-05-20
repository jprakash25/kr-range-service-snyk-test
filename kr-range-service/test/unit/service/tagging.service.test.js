const { extractData, getFailedProducts, saveTaggedData } = require('../../../src/service/tagging.service')
const propertiesService = require('../../../src/service/properties.service')
const loggerService = require('../../../src/service/logger.service')
const productPropertiesService = require('../../../src/service/productProperties.service')
const productPropertiesRepository = require('../../../src/lib/repositories/product-properties-repository')
const adService = require('../../../src/service/active-directory.service')
const { extractPeriodCalendar } = require('../../../src/lib/exports/helper')
const axios = require('axios')
const { S3 } = require('../../../src/lib/aws')

jest.mock('../../../src/lib/aws')
jest.mock('axios')
jest.mock('../../../src/lib/repositories/product-properties-repository')
jest.mock('../../../src/lib/repositories/ipm-job-info-repository')
jest.mock('../../../src/service/properties.service')
jest.mock('../../../src/service/productProperties.service')
jest.mock('../../../src/service/kmart-product-properties.service')
jest.mock('../../../src/service/logger.service')
jest.mock('../../../src/service/active-directory.service')
jest.mock('../../../src/lib/exports/helper')

jest.useFakeTimers()

describe('Tagging Service', () => {

  describe('Extract data', () => {
    let lastTriggerTime = '2021-09-01T08:30:00.00+00:00'
    let productProperties = [
      {
        productId: '1',
        sourceId: '1'
      },
      {
        productId: '2',
        sourceId: '2'
      }
    ]
    let data = [
      {
        core_range_dates: {
          core_on_range_date: '01/11/2020',
          core_off_range_date: '01/06/2021'
        },
        name: 'KHUB ON RANGE DATE',
        property_value: 'PD05WK01F21',
        optionId: '1',
        dssRefNo: '2',
        keycodeType: 'Single',
        keycode: 123456,
        is_registered: true
      },
      {
        core_range_dates: {
          core_on_range_date: '01/11/2020',
          core_off_range_date: '01/06/2021'
        },
        name: 'KHUB OFF RANGE DATE',
        property_value: 'PD12WK01F21',
        optionId: '1',
        dssRefNo: '2',
        keycodeType: 'Single',
        keycode: 123456,
        is_registered: true
      },
      {
        core_range_dates: {
          core_on_range_date: '01/11/2020',
          core_off_range_date: '01/06/2021'
        },
        name: 'KHUB',
        property_value: 'Y',
        optionId: '1',
        dssRefNo: '2',
        keycodeType: 'Single',
        keycode: 123456,
        is_registered: true
      },
      {
        core_range_dates: {
          core_on_range_date: '01/11/2020',
          core_off_range_date: '01/06/2021'
        },
        name: 'KHUB PLUS',
        property_value: 'N',
        optionId: '2',
        dssRefNo: '3',
        keycodeType: 'Style',
        styleId: 123456,
        is_registered: true
      }
    ]
    let response = [{
      optionId: '1',
      dssRefNo: '2',
      onRangeDate: '01/11/2020',
      offRangeDate: '01/06/2021',
      channel: 'K_HUB',
      integrationStatus: 'Registered',
      fleet_on_range: '01/11/2020',
      fleet_off_range: '01/06/2021',
      subChannel: 'khub_base',
      isRanged: true,
      keycode: 123456,
      styleId: '',
      keycodeType: 'Single'
    }, {
      optionId: '2',
      dssRefNo: '3',
      onRangeDate: '',
      offRangeDate: '',
      channel: 'K_HUB',
      integrationStatus: 'Registered',
      fleet_on_range: '01/11/2020',
      fleet_off_range: '01/06/2021',
      subChannel: 'khub_plus',
      isRanged: false,
      keycode: '',
      styleId: 123456,
      keycodeType: 'Style',
      excluded: true
    }]
    let periodList = [{
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

    beforeEach(() => {
      extractPeriodCalendar.mockImplementation(() => {
        return Promise.resolve(periodList)
      })
      productPropertiesRepository.extractDataForExternalSystems
        .mockReturnValueOnce(new Promise((resolve, reject) => {
          resolve(data)
        }))
        .mockReturnValueOnce(new Promise((resolve, reject) => {
          resolve([])
        }))
      productPropertiesRepository.findLatestProductProperties.mockImplementation(() => {
        return Promise.resolve(productProperties)
      })
      adService.getBearerTokenForExternalSystem.mockImplementation(() => {
        return Promise.resolve(true)
      })
      axios.put.mockImplementation(() => {
        return Promise.resolve({ data: false })
      })
      S3.s3GetObject.mockImplementation(() => {
        return {
          promise: jest.fn().mockResolvedValue({
            Body: Buffer.from(JSON.stringify(data), 'utf8')
          })
        }
      })
    })

    it('Should return entire data for each store format', async () => {
      let result = await extractData(lastTriggerTime)
      expect(result).toEqual(response)
    })

    it('Should return data for each store format', async () => {
      lastTriggerTime = ''
      await extractData(lastTriggerTime)
        .catch(e => {
          expect(e.message).toEqual('Last trigger time is not defined')
        })
    })
  })

  describe('Failed Products', () => {
    let data = [{
      optionId: '1',
      dssRefNo: '1',
      keycode: 123
    }, {
      optionId: '2',
      dssRefNo: '2',
      styleId: 123,
      primaryColor: 'abc',
      secondaryColor: 'def'
    }]
    let error = [{
      error: 'Not ranged for any standard stores',
      keycode: 123
    }, {
      error: 'Not ranged for any standard stores',
      styleId: 123,
      primaryColour: 'abc',
      secondaryColour: 'def'
    }]
    let result = [{
      source_id: '1',
      product_id: '1'
    }, {
      source_id: '2',
      product_id: '2'
    }]

    it('Should return error list for failed products', () => {
      let list = getFailedProducts(error, data)
      expect(list).toEqual(result)
    })
  })

  describe('Save tagged data', () => {
    let products = [{
      tagged_data: {
        'khub': 'Y',
        'khub_plus': 'N'
      },
      source_id: '1',
      product_id: '2'
    }]
    let type = 'khub'
    let username = 'test'
    let editableProperties = { 'Khub': 1, 'Khub Plus': 2 }

    beforeEach(() => {
      propertiesService.transformPropertiesIntoNameIdPair.mockImplementation(() => {
        return editableProperties
      })
    })

    it('Should save khub tagged data', async () => {
      await saveTaggedData({ products, type, username })
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('Should return error when failed to save tagged data', async () => {
      productPropertiesService.bulkInsert_SheetUpload.mockImplementation(() => {
        throw new Error('error')
      })
      try {
        await saveTaggedData({ products, type, username })
      } catch (err) { }
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('Should save kmart tagged data', async () => {
      type = 'kmart'
      await saveTaggedData({ products, type, username })
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })
})
