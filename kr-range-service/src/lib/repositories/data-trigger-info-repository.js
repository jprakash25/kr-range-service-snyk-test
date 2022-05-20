const models = require('./../models')
const { logger } = require('../../service/logger.service')

exports.saveLastTriggerInfo = (model, updateInfo) => {
  try {
    const { data_trigger_info } = models()
    const options = {
      fields: ['triggeredBy', 'khubTriggerTime', 'kmartTriggerTime'],
      updateOnDuplicate: [updateInfo]
    }
    return data_trigger_info.bulkCreate(model, options)
  } catch (error) {
    logger.error({ error }, 'Error while updating data trigger info')
    throw new Error(error)
  }
}

exports.getLastTriggerTime = async ({ triggeredBy, type }) => {
  const { data_trigger_info } = models()
  let attributes = []
  if (type === 'khub') {
    attributes = ['khubTriggerTime']
  } else {
    attributes = ['kmartTriggerTime']
  }
  let options = {}
  if (triggeredBy) {
    options.triggeredBy = triggeredBy
  }
  const params = {
    where: options,
    attributes: attributes,
    raw: true
  }
  return data_trigger_info.findOne(params)
}
