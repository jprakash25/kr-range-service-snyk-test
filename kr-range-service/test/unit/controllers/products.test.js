/* eslint-env jest */
const ProductsController = require('../../../src/controllers/products')
const productsService = require('../../../src/service/products.service')
const loggerService = require('../../../src/service/logger.service')

jest.mock('../../../src/service/products.service')
jest.mock('../../../src/service/logger.service')

describe('Unit:::Products Controller', () => {
  let res; let req = {}
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    }
  })

  describe('delete products by sourceId function', () => {
    beforeEach(() => {
      req.params = {
        sourceid: 1
      }
    })

    it('should return if no source id', async () => {
      req.params = {}
      ProductsController.deleteProductsBySourceId()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(0)
    })

    it('should return 500 if product is not deleted', async () => {
      productsService.deleteProductsBySourceId.mockImplementation(() => {
        return Promise.resolve()
      })
      req.params.sourceid = 1
      await ProductsController.deleteProductsBySourceId()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('should return success when product is valid', async () => {
      productsService.deleteProductsBySourceId.mockImplementation(() => {
        return Promise.resolve({ message: 'success' })
      })
      await ProductsController.deleteProductsBySourceId()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('should return success when product is valid', async () => {
      productsService.deleteProductsBySourceId.mockImplementation(() => {
        return Promise.resolve({ data: '' })
      })
      await ProductsController.deleteProductsBySourceId()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })
})
