const models = require('./../models')
const { logger } = require('../../service/logger.service')
const { Op } = require('sequelize')

exports.bulkCreate = async (kmartProductPropertiesModel, transactionId = null) => {
  try {
    const { kmart_product_properties } = models()
    const options = {
      fields: ['productId', 'sourceId', 'coreOnRangeDate', 'coreOffRangeDate', 'coreOnRangePeriod', 'coreOffRangePeriod',
        'planC', 'nonPlanC', 'smallFleet', 'onlineOnly', 'aws', 'lspl', 'username', 'createdAt', 'updatedAt'],
      updateOnDuplicate: ['coreOnRangeDate', 'coreOffRangeDate', 'coreOnRangePeriod', 'coreOffRangePeriod',
        'planC', 'nonPlanC', 'smallFleet', 'onlineOnly', 'aws', 'lspl', 'username', 'updatedAt']
    }
    if (transactionId) {
      options.transactionId = transactionId
    }
    return kmart_product_properties.bulkCreate(kmartProductPropertiesModel, options)
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating kmart product properties')
    throw new Error(error)
  }
}

exports.getKmartProductProperties = async ({ productId, sourceId }) => {
  const { kmart_product_properties } = models()
  const options = {
    where: {
      productId: {
        [Op.in]: productId
      },
      sourceId: {
        [Op.in]: sourceId
      }
    },
    raw: true
  }

  return kmart_product_properties.findAll(options)
}
