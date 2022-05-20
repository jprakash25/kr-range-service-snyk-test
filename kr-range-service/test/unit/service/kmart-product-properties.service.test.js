/* eslint-env jest */
const kmartProductPropertyService = require('../../../src/service/kmart-product-properties.service')

describe('Service:::Kmart Product Property', () => {

  describe('Method:::transformTaggedDataToModel', () => {
    let data = [{
      product_id: '123',
      source_id: '123',
      tagged_data: {
        test: 'Y'
      }
    }, {
      product_id: '456',
      source_id: '456',
      tagged_data: {
        test: 'N'
      }
    }]

    let expectedData = [{
      productId: '123',
      sourceId: '123',
      taggedProperties: {
        test: 'Y'
      }
    }, {
      productId: '456',
      sourceId: '456',
      taggedProperties: {
        test: 'N'
      }
    }]

    it('should return proper kmart product property model', async () => {
      expect(kmartProductPropertyService.transformTaggedDataToModel(data).length).toEqual(2)
    })
  })

})
