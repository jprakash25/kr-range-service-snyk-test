const { dssEventTransform } = require('./../../../../src/lib/dss/export-event-parser')
const loggerService = require('./../../../../src/service/logger.service')
const event = require('../../../fixtures/dss_event_transform_event.json')

jest.mock('../../../../src/service/logger.service')

describe('export event parser', () => {

  describe('DSS event transform', () => {

    it('should transform data if event is valid', () => {
      dssEventTransform(event)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('should throw error if event is invalid', () => {
      try {
        dssEventTransform({})
      } catch (err) {
        console.log(err)
      }
      expect(loggerService.logger.error).toHaveBeenCalled()
    })

  })
})
