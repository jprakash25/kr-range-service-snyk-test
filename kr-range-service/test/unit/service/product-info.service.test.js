const { getTaggedProducts } = require('../../../src/service/product-info.service')
const productInfoV2Repository = require('../../../src/lib/repositories/product-info-v2-repository')
const helper = require('../../../src/lib/exports/helper')

jest.mock('../../../src/lib/repositories/product-info-v2-repository')
jest.mock('../../../src/util/tagged-products')
jest.mock('../../../src/lib/exports/helper')

describe('Product info service', () => {

  describe('Get tagged products', () => {
    let params = {}
    let periodCalendar = [
      {
        start_week_date: '14/03/2022',
        end_week_date: '20/03/2022',
        period: 'PD09WK03F22'
      }, {
        start_week_date: '28/03/2022',
        end_week_date: '03/04/2022',
        period: 'PD10WK01F22'
      }
    ]
    let products
    let expectedResult

    beforeEach(() => {
      products = [
        {
          product_id: '1',
          source_id: '1',
          name: 'KHUB ON RANGE DATE',
          property_value: 'PD09WK03F22',
          aws: 123,
          lspl: 123,
          plan_c: 'Y',
          non_plan_c: 'Y',
          keycode_type: 'Single',
          keycodes: [123],
          status_code: {
            australia: [3, 3, 4, 0],
            newZealand: [3, 3, 4, 4]
          },
          core_range_dates: {
            core_off_range_date: '03/04/2022',
            core_on_range_date: '14/03/2022',
            core_off_range_period: 'PD09WK03F22',
            core_on_range_period: 'PD10WK01F22'
          },
          exclusions: {
            khub: {
              khub_base: {
                excluded: true,
                effectiveDate: '2022-01-01T00:00:00.000Z',
                expiryDate: '9999-06-01T00:00:00.000Z'
              }
            },
            kmart: {
              kmart_small_fleet: {
                excluded: true,
                effectiveDate: '2022-01-01T00:00:00.000Z',
                expiryDate: '9999-06-01T00:00:00.000Z'
              }
            }
          }
        }, {
          product_id: '1',
          source_id: '1',
          name: 'KHUB OFF RANGE DATE',
          property_value: 'PD10WK01F22',
          aws: 123,
          lspl: 123,
          plan_c: 'Y',
          non_plan_c: 'Y',
          keycode_type: 'Single',
          keycodes: [123],
          status_code: {
            australia: [3, 3, 4, 0],
            newZealand: [3, 3, 4, 4]
          },
          core_range_dates: {
            core_off_range_date: '28/03/2022',
            core_on_range_date: '14/03/2022',
            core_off_range_period: 'PD09WK03F22',
            core_on_range_period: 'PD10WK01F22'
          },
          exclusions: {
            khub: {
              khub_base: {
                excluded: true,
                effectiveDate: '2022-01-01T00:00:00.000Z',
                expiryDate: '9999-06-01T00:00:00.000Z'
              }
            },
            kmart: {
              kmart_small_fleet: {
                excluded: true,
                effectiveDate: '2022-01-01T00:00:00.000Z',
                expiryDate: '9999-06-01T00:00:00.000Z'
              }
            }
          }
        }, {
          product_id: '2',
          source_id: '2',
          name: 'KHUB ON RANGE DATE',
          property_value: 'PD09WK03F22',
          keycode_type: 'Style',
          styleNumber: 123,
          keycodes: [456],
          status_code: {
            australia: [3, 3, 4, 0],
            newZealand: [3, 3, 4, 4]
          },
          core_range_dates: {
            core_off_range_date: '28/03/2022',
            core_on_range_date: '14/03/2022',
            core_off_range_period: 'PD09WK03F22',
            core_on_range_period: 'PD10WK01F22'
          },
          exclusions: {
            khub: {
              khub_base: {
                excluded: false,
                effectiveDate: '',
                expiryDate: ''
              }
            },
            kmart: {
              kmart_small_fleet: {
                excluded: false,
                effectiveDate: '',
                expiryDate: ''
              }
            }
          }
        }
      ]
      expectedResult = [
        {
          _id: '11',
          product_id: '1',
          source_id: '1',
          tagged_data: {
            khub: {
              khub_on_range_date: '14/03/2022',
              khub_off_range_date: '28/03/2022',
              khub_off_range_period: 'PD10WK01F22',
              khub_on_range_period: 'PD09WK03F22'
            },
            kmart: {
              core_off_range_date: '03/04/2022',
              core_on_range_date: '14/03/2022',
              core_off_range_period: 'PD09WK03F22',
              core_on_range_period: 'PD10WK01F22',
              aws: 123,
              lspl: 123,
              plan_c: 'Y',
              non_plan_c: 'Y',
              small_fleet: undefined,
              online_only: undefined
            }
          },
          tagged_data_variations: {
            has_country_variations: undefined,
            country_variations_properties: undefined,
            has_climatic_variations: undefined,
            climatic_variations_properties: undefined,
            has_state_variations: undefined,
            state_variations_properties: undefined
          },
          dssProduct: {
            itemDescription: undefined,
            itemNo: undefined,
          },
          keycode_type: 'Single',
          keycode: 123,
          keycodes: [123],
          styleNumber: null,
          status_code: {
            australia: undefined,
            newZealand: undefined
          },
          name: 'KHUB ON RANGE DATE',
          product_source_id: '11',
          property_value: 'PD09WK03F22',
          core_range_dates: {
            core_off_range_date: '03/04/2022',
            core_on_range_date: '14/03/2022',
            core_off_range_period: 'PD09WK03F22',
            core_on_range_period: 'PD10WK01F22'
          },
          exclusions: {
            khub: {
              khub_base: true
            },
            kmart: {
              kmart_small_fleet: true
            }
          }
        }, {
          _id: '22',
          product_id: '2',
          source_id: '2',
          tagged_data: {
            khub: {
              khub_on_range_date: '14/03/2022',
              khub_on_range_period: 'PD09WK03F22'
            },
            kmart: {
              core_off_range_date: '28/03/2022',
              core_on_range_date: '14/03/2022',
              core_off_range_period: 'PD09WK03F22',
              core_on_range_period: 'PD10WK01F22',
              aws: undefined,
              lspl: undefined,
              plan_c: undefined,
              non_plan_c: undefined,
              small_fleet: undefined,
              online_only: undefined
            }
          },
          tagged_data_variations: {
            has_country_variations: undefined,
            country_variations_properties: undefined,
            has_climatic_variations: undefined,
            climatic_variations_properties: undefined,
            has_state_variations: undefined,
            state_variations_properties: undefined
          },
          dssProduct: {
            itemDescription: undefined,
            itemNo: undefined,
          },
          keycode_type: 'Style',
          keycode: null,
          keycodes: [456],
          styleNumber: 123,
          status_code: {
            australia: undefined,
            newZealand: undefined
          },
          name: 'KHUB ON RANGE DATE',
          product_source_id: '22',
          property_value: 'PD09WK03F22',
          core_range_dates: {
            core_off_range_date: '28/03/2022',
            core_on_range_date: '14/03/2022',
            core_off_range_period: 'PD09WK03F22',
            core_on_range_period: 'PD10WK01F22'
          },
          exclusions: {
            khub: {
              khub_base: false
            },
            kmart: {
              kmart_small_fleet: false
            }
          }
        }
      ]
      params = {
        limit: 10,
        page: 1,
        type: 'khub'
      }
      productInfoV2Repository.getTaggedProductsCount.mockImplementation(() => {
        return Promise.resolve([{ count: 2 }])
      })
      helper.extractPeriodCalendar.mockImplementation(() => {
        return Promise.resolve(periodCalendar)
      })
      productInfoV2Repository.getTaggedProductsList.mockImplementation(() => {
        return Promise.resolve(products)
      })
    })

    it('Should return tagged products', async () => {
      let result = await getTaggedProducts(params)
      expect(result.total).toEqual(2)
      expect(result.products).toEqual(expectedResult)
    })

    it('Should return tagged products based on count', async () => {
      productInfoV2Repository.getTaggedProductsCount.mockImplementation(() => {
        return Promise.resolve([{ count: 50 }])
      })
      params.page = 4
      let result = await getTaggedProducts(params)
      expect(result.total).toEqual(50)
      expect(result.products).toEqual(expectedResult)
    })

    it('Should return empty when count is 0', async () => {
      productInfoV2Repository.getTaggedProductsCount.mockImplementation(() => {
        return Promise.resolve([{ count: 0 }])
      })
      let result = await getTaggedProducts(params)
      expect(result.total).toEqual(0)
      expect(result.products).toEqual([])
    })

    it('Should return error when tagged products fail', async () => {
      productInfoV2Repository.getTaggedProductsCount.mockImplementation(() => {
        throw new Error('Error')
      })
      await getTaggedProducts(params)
        .catch(e => {
          expect(e.message).toEqual('Getting tagged products failed')
        })
    })

  })

})
