const models = require('./../models')
const { logger } = require('../../service/logger.service')
const { Op } = require('sequelize')

exports.saveProperty = (propertiesModel, transactionId = null) => {
  const { properties } = models()
  const options = {}
  if (transactionId) {
    options.transactionId = transactionId
  }
  return properties.create(propertiesModel, options)
}

exports.bulkCreate = (propertiesModel, transactionId = null) => {
  try {
    const { properties } = models()
    const options = {
      fields: ['name', 'type', 'isEditable', 'createdAt'],
      updateOnDuplicate: ['name', 'type', 'isEditable']
    }
    if (transactionId) {
      options.transactionId = transactionId
    }
    return properties.bulkCreate(propertiesModel, options)
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating properties')
    throw new Error(error)
  }
}

exports.getProperties = async (channelType, propertyName) => {
  const { properties } = models()
  let options = {
    isEditable: true,
    type: channelType
  }
  if (propertyName) {
    options.name = {
      [Op.in]: propertyName
    }
  }
  const params = {
    where: options,
    attributes: ['id', 'name'],
    raw: true
  }
  return properties.findAll(params)
}
