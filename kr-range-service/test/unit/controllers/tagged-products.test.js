/* eslint-env jest */
const { TaggedProductsController } = require('../../../src/controllers')
const productInfoV2Service = require('../../../src/service/product-info.service')
const departmentService = require('../../../src/service/department.service')
const dataTriggerInfoService = require('../../../src/service/data-trigger-info.service')
const taggingService = require('../../../src/service/tagging.service')
const userProfileService = require('../../../src/service/user-profile.service')
const userSocketService = require('../../../src/service/user-socket.service')
const periodCalendarService = require('../../../src/service/period-calendar.service')
const loggerService = require('../../../src/service/logger.service')

jest.mock('../../../src/service/product-info.service')
jest.mock('../../../src/service/department.service')
jest.mock('../../../src/service/logger.service')
jest.mock('../../../src/service/tagging.service')
jest.mock('../../../src/service/tagging.service')
jest.mock('../../../src/service/user-profile.service')
jest.mock('../../../src/service/user-socket.service')
jest.mock('../../../src/service/data-trigger-info.service')
jest.mock('../../../src/service/period-calendar.service')

describe('Unit:::Tagged Products Controller', () => {
  let res; let req
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('get Tagged Products function', () => {
    beforeEach(() => {
      req = {
        body: {
          per_page: '25',
          offset: '0'
        },
        restrictedAccess: true
      }
    })

    it('should default values when params are not provided', async () => {
      req = {
        body: {}
      }
      TaggedProductsController.getTaggedProducts()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('should throw error when error from getTaggedProducts function', async () => {
      productInfoV2Service.getTaggedProducts.mockImplementation(() => {
        throw new Error('error')
      })
      TaggedProductsController.getTaggedProducts()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('should return success when request is valid', async () => {
      productInfoV2Service.getTaggedProducts.mockImplementation(() => {
        return Promise.resolve({ products: [], total: 0 })
      })
      await TaggedProductsController.getTaggedProducts()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('get Product Filters function', () => {
    beforeEach(() => {
      req = {
        query: {
          type: 'khub'
        }
      }
    })

    it('should throw error when error from getFiltersList function', async () => {
      departmentService.getDepartmentFilters.mockImplementation(() => {
        throw new Error('error')
      })
      TaggedProductsController.getProductFilters()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('should not throw error when type is not passed', async () => {
      req = {}
      TaggedProductsController.getProductFilters()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('should return success when request is valid', async () => {
      departmentService.getDepartmentFilters.mockImplementation(() => {
        return Promise.resolve({})
      })
      await TaggedProductsController.getProductFilters()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('extract tagged data for external systems', () => {
    it('should trigger external data extraction', async () => {
      dataTriggerInfoService.saveTriggerInfo.mockImplementation(() => {
        return Promise.resolve({})
      })
      dataTriggerInfoService.getLastTriggeredTime.mockImplementation(() => {
        return Promise.resolve('2020-01-01')
      })
      await TaggedProductsController.taggedDataForExternalSystems()(req, res)
      expect(dataTriggerInfoService.saveTriggerInfo).toBeCalledTimes(1)
      expect(dataTriggerInfoService.getLastTriggeredTime).toBeCalledTimes(1)
      expect(taggingService.extractData).toBeCalledTimes(1)
    })

    it('should trigger external data extraction', async () => {
      dataTriggerInfoService.saveTriggerInfo.mockImplementation(() => {
        throw new Error('error')
      })
      await TaggedProductsController.taggedDataForExternalSystems()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })
  })

  describe('update tagged data', () => {
    beforeEach(() => {
      req = {
        body: {
          products: [{ tagged_data: { khub: 'Y' } }]
        }
      }
    })

    it('when no products, saveTaggedData should not be called', async () => {
      req.body.products = []
      await TaggedProductsController.updateTaggedData()(req, res)
      expect(taggingService.saveTaggedData).toBeCalledTimes(0)
    })

    it('when saveTaggedData throws error, should return error', async () => {
      taggingService.saveTaggedData.mockImplementation(() => {
        throw new Error('error')
      })
      await TaggedProductsController.updateTaggedData()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when products, saveTaggedData should be called', async () => {
      await TaggedProductsController.updateTaggedData()(req, res)
      expect(taggingService.saveTaggedData).toBeCalledTimes(1)
    })
  })

  describe('get period list', () => {
    it('when extractPeriodList throws error, should return error', async () => {
      periodCalendarService.extractPeriodList.mockImplementation(() => {
        throw new Error('error')
      })
      await TaggedProductsController.getPeriodList()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when extractPeriodList returns successfully, no error logger will be called', async () => {
      await TaggedProductsController.getPeriodList()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('get user access type', () => {
    beforeEach(() => {
      req = {
        restrictedAccess: true
      }
    })

    it('when userAccessType throws error, should return error', async () => {
      req = undefined
      await TaggedProductsController.getUserAccessType()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when restrictedAccess is true return kmart', async () => {
      let result = await TaggedProductsController.getUserAccessType()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('when restrictedAccess is false return khub', async () => {
      req.restrictedAccess = false
      let result = await TaggedProductsController.getUserAccessType()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('update valid product', () => {
    it('when updateValidProductInfo throws error, should return error', async () => {
      productInfoV2Service.updateValidProductInfo.mockImplementation(() => {
        throw new Error('error')
      })
      await TaggedProductsController.updateValidProduct()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when updateValidProductInfo returns successfully, no error logger will be called', async () => {
      await TaggedProductsController.updateValidProduct()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('acquire or release lock', () => {
    beforeEach(() => {
      req = {
        body: {
          lock: 'acquire'
        }
      }
    })

    it('when no lock, should throw lock is required error', async () => {
      req.body.lock = ''
      await TaggedProductsController.acquireOrReleaseLock()(req, res)
      expect(userProfileService.acquireReleaseLock).toBeCalledTimes(0)
    })

    it('when acquireReleaseLock throws error, should return error', async () => {
      userProfileService.acquireReleaseLock.mockImplementation(() => {
        throw new Error('error')
      })
      await TaggedProductsController.acquireOrReleaseLock()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when lock is acquired by another user, should return 400', async () => {
      userProfileService.acquireReleaseLock.mockImplementation(() => {
        return Promise.resolve('test')
      })
      await TaggedProductsController.acquireOrReleaseLock()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(1)
    })

    it('when lock is not acquired by another user, should return 200', async () => {
      userProfileService.acquireReleaseLock.mockImplementation(() => {
        return Promise.resolve(null)
      })
      await TaggedProductsController.acquireOrReleaseLock()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(1)
    })
  })

  describe('get lock state', () => {

    it('when lockState throws error, should return error', async () => {
      userProfileService.lockState.mockImplementation(() => {
        throw new Error('error')
      })
      await TaggedProductsController.getLockState()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when lock is acquired by another user, should return 400', async () => {
      userProfileService.lockState.mockImplementation(() => {
        return Promise.resolve('test')
      })
      await TaggedProductsController.getLockState()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(1)
    })

    it('when lock is not acquired by another user, should return 200', async () => {
      userProfileService.lockState.mockImplementation(() => {
        return Promise.resolve(null)
      })
      await TaggedProductsController.getLockState()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(1)
    })
  })

  describe('update user profile', () => {

    beforeEach(() => {
      req = {
        body: {
          clientId: '123'
        },
        restrictedAccess: true
      }
    })

    it('when no clientId provided, should return error', async () => {
      req = {
        body: {}
      }
      await TaggedProductsController.updateUserProfile()(req, res)
      expect(userProfileService.updateUserProfile).toBeCalledTimes(0)
    })

    it('when service throws error, should return error', async () => {
      userProfileService.updateUserProfile.mockImplementation(() => {
        throw new Error('Error')
      })
      await TaggedProductsController.updateUserProfile()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when service return success, should return 200', async () => {
      await TaggedProductsController.updateUserProfile()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('update user state', () => {

    beforeEach(() => {
      req = {
        body: {
          userState: {
            location: {
              country: true,
              climatic: false,
              state: true
            }
          }
        },
        user: {}
      }
    })

    it('when no userState provided, should return error', async () => {
      req = {
        body: {}
      }
      await TaggedProductsController.updateUserState()(req, res)
      expect(userProfileService.updateUserStateDetails).toBeCalledTimes(0)
    })

    it('when service throws error, should return error', async () => {
      userProfileService.updateUserStateDetails.mockImplementation(() => {
        throw new Error('Error')
      })
      await TaggedProductsController.updateUserState()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when service return success, should return 200', async () => {
      await TaggedProductsController.updateUserState()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('remove socket id', () => {

    beforeEach(() => {
      req = {
        params: {
          socketid: '123'
        }
      }
    })

    it('when no socketid provided, should return error', async () => {
      req = {
        params: {}
      }
      await TaggedProductsController.removeSocketId()(req, res)
      expect(userSocketService.deleteSocketId).toBeCalledTimes(0)
    })

    it('when service throws error, should return error', async () => {
      userSocketService.deleteSocketId.mockImplementation(() => {
        throw new Error('Error')
      })
      await TaggedProductsController.removeSocketId()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })

    it('when service return success, should return 200', async () => {
      await TaggedProductsController.removeSocketId()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })
})
