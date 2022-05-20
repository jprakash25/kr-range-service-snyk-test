const cds_event = require('../../../../fixtures/cds-input.json')
const productInfoV2Repository = require('../../../../../src/lib/repositories/product-info-v2-repository')
const uploadBlacklistWhitelistRepository = require('../../../../../src/lib/repositories/upload-blacklist-whitelist-repository')
const familyDataRepository = require('../../../../../src/lib/repositories/family-data-repository')
const { processCDSEvent } = require('../../../../../src/lib/input-sources/cds/event-processor')
const { logger } = require('../../../../../src/service/logger.service')
const whitelistBlacklst = require('../../../../../src/lib/rules/whitelist-blacklist')
const adService = require('../../../../../src/service/active-directory.service')

jest.mock('../../../../../src/lib/repositories/product-info-v2-repository')
jest.mock('../../../../../src/service/logger.service')
jest.mock('../../../../../src/lib/repositories/upload-blacklist-whitelist-repository')
jest.mock('../../../../../src/lib/repositories/family-data-repository')
jest.mock('../../../../../src/lib/exports/helper')
jest.mock('../../../../../src/lib/exports/validations')
jest.mock('../../../../../src/lib/rules/whitelist-blacklist')
jest.mock('../../../../../src/service/active-directory.service')
jest.mock('axios')

describe('cds:event-processor', () => {
  describe('Process CDS Event', () => {
    let input
    beforeEach(() => {
      input = JSON.parse(JSON.stringify(cds_event))
      productInfoV2Repository.isLatestEvent.mockImplementation(() => {
        return true
      })
      uploadBlacklistWhitelistRepository.findBlacklistWhitelistByChannels.mockImplementation(() => {
        return []
      })
      whitelistBlacklst.getExclusions.mockImplementation(() => {
        return { exclusions: { khub: {}, kmart: {} } }
      })
      familyDataRepository.getFamilyId.mockImplementation(() => {
        return { familyId: 1 }
      })
      adService.getBearerTokenForExternalSystem.mockImplementation(() => {
        return Promise.resolve({ accessToken: 'cjldcac' })
      })
    })

    it('should return false if not latest event', async () => {
      productInfoV2Repository.isLatestEvent.mockImplementation(() => {
        return false
      })
      let result = await processCDSEvent(input)
      expect(result).toBe(false)
    })

    it('should save to db if event is valid', async () => {
      await processCDSEvent(input)
      expect(logger.error).not.toBeCalled()
    })

    it('should throw error if db fails', async () => {
      productInfoV2Repository.deleteProductInfoV2BySourceId.mockImplementation(() => {
        throw new Error('Error while deleting product')
      })
      await processCDSEvent(input)
        .catch(e => {
          expect(e.message).toEqual('Error while deleting product')
        })
    })

    it('should log error and save to db if product is not valid for single keycodetype', async () => {
      input.event.keycodeType = 'Single'
      input.products[0].option.sizes[0].keycodeNumber = null
      await processCDSEvent(input)
      expect(logger.error).toBeCalled()
    })

    it('should save keycode to db if product is valid for single keycodetype', async () => {
      input.event.keycodeType = 'Single'
      await processCDSEvent(input)
      expect(logger.error).not.toBeCalled()
    })

    it('should log error and save to db if product is not valid for style keycodetype', async () => {
      input.event.styleNumber = null
      await processCDSEvent(input)
      expect(logger.error).toBeCalled()
    })

    it('should log error and save to db if product is not valid for style keycodetype', async () => {
      input.products[0].option.primaryColour.name = null
      await processCDSEvent(input)
      expect(logger.error).toBeCalled()
    })

    it('should log error and save to db if product is not valid for style keycodetype', async () => {
      input.products[0].option.secondaryColour.name = null
      await processCDSEvent(input)
      expect(logger.error).toBeCalled()
    })

    it('should log error if keycodeType is null', async () => {
      input.event.keycodeType = null
      await processCDSEvent(input)
      expect(logger.error).toBeCalled()
    })

    it('should save keycode to db if product is preregistered', async () => {
      input.event.dssProduct.integrationStatus = 'preregistered'
      input.event.keycodeType = 'Single'
      await processCDSEvent(input)
      expect(logger.error).not.toBeCalled()
    })
  })
})
