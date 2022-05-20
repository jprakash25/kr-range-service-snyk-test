const { saveLastTriggerInfo, getLastTriggerTime } = require('../lib/repositories/data-trigger-info-repository')

const saveTriggerInfo = async ({ triggeredBy, type }) => {
  let params = { triggeredBy }
  let updateInfo
  if (type === 'khub') {
    params.khubTriggerTime = new Date()
    updateInfo = 'khubTriggerTime'
  } else {
    params.kmartTriggerTime = new Date()
    updateInfo = 'kmartTriggerTime'
  }
  return saveLastTriggerInfo([params], updateInfo)
}

const getLastTriggeredTime = async (params) => {
  return getLastTriggerTime(params)
}

module.exports = {
  saveTriggerInfo,
  getLastTriggeredTime
}
