const { saveTriggerInfo, getLastTriggeredTime } = require('../../../src/service/data-trigger-info.service')
const dataTriggerInfoRepository = require('../../../src/lib/repositories/data-trigger-info-repository')

jest.mock('../../../src/lib/repositories/data-trigger-info-repository')

describe('Data Trigger Info Service', () => {

  describe('Save trigger info', () => {
    let params = {
      triggeredBy: 'test',
      type: 'khub'
    }

    it('Should call saveLastTriggerInfo when type is khub', async () => {
      await saveTriggerInfo(params)
      expect(dataTriggerInfoRepository.saveLastTriggerInfo).toBeCalledTimes(1)
    })

    it('Should call saveLastTriggerInfo when type is kmart', async () => {
      params.type = 'kmart'
      await saveTriggerInfo(params)
      expect(dataTriggerInfoRepository.saveLastTriggerInfo).toBeCalledTimes(1)
    })
  })

  describe('Get last trigger info', () => {
    it('Should call getLastTriggerTime when type is khub', async () => {
      await getLastTriggeredTime({})
      expect(dataTriggerInfoRepository.getLastTriggerTime).toBeCalledTimes(1)
    })
  })
})
