/* eslint-env jest */
const { propertiesController } = require('../../../src/controllers')
const propertiesService = require('../../../src/service/properties.service')
const loggerService = require('../../../src/service/logger.service')

jest.mock('../../../src/service/properties.service')
jest.mock('../../../src/service/logger.service')

describe('Unit:::Properties Controller', () => {
  let res; const req = {}
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('bulk update function', () => {
    it('should call bulk update function', async () => {
      propertiesController.bulkUpdateProperties()(req, res)
      expect(propertiesService.bulkUpdate).toBeCalledTimes(1)
    })

    it('should throw error when error from bulk update function', async () => {
      propertiesService.bulkUpdate.mockImplementation(() => {
        throw new Error('error')
      })
      propertiesController.bulkUpdateProperties()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })
  })
})
