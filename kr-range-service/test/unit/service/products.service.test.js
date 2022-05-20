const { deleteProductsBySourceId } = require('../../../src/service/products.service')
const productInfoV2Repository = require('../../../src/lib/repositories/product-info-v2-repository')

jest.mock('../../../src/lib/repositories/product-info-v2-repository')

describe('Products Service', () => {

  describe('Delete Products BY SourceId', () => {
    let sourceId = 1

    it('Should return no products found for wrong sourceId', async () => {
      productInfoV2Repository.getProductIdsBySourceId.mockImplementation(() => {
        return Promise.resolve([])
      })
      let result = await deleteProductsBySourceId(sourceId)
      expect(result.message).toEqual('No products found')
    })

    it('Should return false when error while fetching products', async () => {
      productInfoV2Repository.getProductIdsBySourceId.mockImplementation(() => {
        throw new Error('error')
      })
      let result = await deleteProductsBySourceId(sourceId)
      expect(result).toEqual(false)
    })
  })
})
