/* eslint-env jest */
const mockDate = require('mockdate')
const { validateProduct } = require('../../../../src/lib/dss/export-validations')

const getProductStatusCodeObject = (code) => ({
  productStatus: {
    australia: {
      code
    }
  }
})

const productData = {
  product_data: {
    year: 2020,
    option: {
      sizes: [
        getProductStatusCodeObject(3),
        getProductStatusCodeObject(3),
      ],
      colourDescription: 'BLACK'
    }
  }
}

describe('validate product', () => {

  describe('validate product based on colourDescription', () => {
    let data = null
    beforeEach(() => data = JSON.parse(JSON.stringify(productData)))

    it('should return true colourDescription is exists', () => {
      expect(validateProduct(data)).toBe(true)
    })

    it('should return false colourDescription is null', () => {
      data.product_data.option.colourDescription = null
      expect(validateProduct(data)).toBe(false)
    })

    it('should return false colourDescription is empty', () => {
      data.product_data.option.colourDescription = ''
      expect(validateProduct(data)).toBe(false)
    })

    it('should return false colourDescription is undefined', () => {
      data.product_data.option.colourDescription = undefined
      expect(validateProduct(data)).toBe(false)
    })
  })

  describe('validate product based on status code and FY', () => {
    let data = null
    beforeEach(() => data = JSON.parse(JSON.stringify(productData)))

    it('should return true as FY is 2021 and dss event year is 2020, so with in 2 years', () => {
      mockDate.set('2021-01-01')
      expect(validateProduct(data)).toBe(true)
    })

    it('should return true as FY is 2022 and dss event year is 2020, so with in 2 years', () => {
      mockDate.set('2021-07-01')
      expect(validateProduct(data)).toBe(true)
    })

    it('should return true as FY is 2021 and dss event year is 2020, so with in 2 years', () => {
      mockDate.set('2021-01-01')
      expect(validateProduct(data)).toBe(true)
    })

    it('should return false as FY is 2022 and dss event year is 2019, so not with in 2 years', () => {
      mockDate.set('2022-01-01')
      data.product_data.year = 2019
      expect(validateProduct(data)).toBe(false)
    })

    it('should return false as FY is 2022 and dss event year is 2019, so not with in 2 years', () => {
      mockDate.set('2021-07-01')
      data.product_data.year = 2019
      expect(validateProduct(data)).toBe(false)
    })

    it('should return true as status codes not contains 3 or 8, even FY is 2022 and dss event year is 2019', () => {
      mockDate.set('2021-07-01')
      data.product_data.year = 2019
      data.product_data.option.sizes = []
      data.product_data.option.sizes.push(getProductStatusCodeObject(5))
      data.product_data.option.sizes.push(getProductStatusCodeObject(2))
      expect(validateProduct(data)).toBe(true)
    })
  })
})
