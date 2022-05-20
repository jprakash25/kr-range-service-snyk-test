/* eslint-env jest */
const propertiesRepository = require('../../../src/lib/repositories/properties-repository')
const propertiesService = require('../../../src/service/properties.service')

jest.mock('../../../src/lib/repositories/properties-repository')

describe('Service:::Properties', () => {
  describe('Bulk Update Method', () => {
    it('should call bulk create method', async () => {
      await propertiesService.bulkUpdate()
      expect(propertiesRepository.bulkCreate).toBeCalledTimes(1)
    })

    it('should throw error when bulk create method fails', async () => {
      propertiesRepository.bulkCreate.mockImplementation(() => {
        throw new Error('error')
      })
      await propertiesService.bulkUpdate()
        .catch(e => {
          expect(e.message).toEqual('error')
        })
    })
  })

  describe('Transform Properties Into Name Id Pair method', () => {
    const properties = [
      {
        id: 1,
        name: 'prop1'
      },
      {
        id: 2,
        name: 'prop2'
      },
      {
        id: 3,
        name: 'prop3'
      }
    ]
    const transformedProperty = {
      prop1: 1,
      prop2: 2,
      prop3: 3
    }
    it('should transform the property into name id pair', () => {
      expect(propertiesService.transformPropertiesIntoNameIdPair(properties)).toEqual(transformedProperty)
    })
  })
})
