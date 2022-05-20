const { Op } = require('sequelize')
const models = require('./../models')
const { logger } = require('../../service/logger.service')
const db = require('../../db')
const Sequelize = require('sequelize')

exports.saveProperty = (productPropertiesModel, transactionId = null) => {
  const { product_properties } = models()
  const options = {}
  if (transactionId) {
    options.transactionId = transactionId
  }
  return product_properties.create(productPropertiesModel, options)
}

exports.deleteProductPropertiesByProductIds = async (productIds, sourceId, transaction = null) => {
  if (!Array.isArray(productIds)) {
    throw new Error('Product Ids should be an array')
  }

  const { product_properties } = models()
  const options = {
    where: {
      productId: {
        [Op.in]: productIds
      },
      sourceId
    }
  }

  if (transaction) {
    options.transaction = transaction
  }
  return product_properties.destroy(options)
}

exports.bulkCreate = async (productPropertiesModel, transactionId = null) => {
  try {
    const { product_properties } = models()
    const options = {
      fields: ['productId', 'sourceId', 'propertyId', 'propertyValue', 'username', 'createdAt', 'updatedAt'],
      updateOnDuplicate: ['propertyValue', 'username', 'updatedAt']
    }
    if (transactionId) {
      options.transactionId = transactionId
    }
    return product_properties.bulkCreate(productPropertiesModel, options)
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating product properties')
    throw new Error(error)
  }
}

exports.getProductProperties = async ({ propertyIdList, productsIdList, sourceIdList }, transactionId = null) => {
  const { product_properties } = models()
  const options = {
    where: {
      propertyId: {
        [Op.in]: propertyIdList
      },
      productId: {
        [Op.in]: productsIdList
      },
      sourceId: {
        [Op.in]: sourceIdList
      }
    },
    raw: true
  }

  if (transactionId) {
    options.transactionId = transactionId
  }

  const result = await product_properties.findAll(options)

  return result
}

exports.findLatestProductProperties = async (updatedAt) => {
  const { product_properties } = models()
  const options = {
    where: {
      updatedAt: {
        [Op.gte]: updatedAt
      }
    },
    attributes: ['productId', 'sourceId'],
  }
  return product_properties.findAll(options)
}

exports.extractDataForExternalSystems = async (filters) => {
  return db.getDB().query(`
    SELECT pi.product_id "optionId", pi.source_id "dssRefNo",
      p.name, pp.property_value, pi.keycode_type "keycodeType", pi.style_number "styleId",
      pi.primary_color "primaryColor", pi.secondary_color "secondaryColor",
      pi.keycode, pi.core_range_dates, pi.is_registered, pp.updated_at "updatedAt"
    FROM product_info_v2 pi
    INNER JOIN
      (SELECT * FROM product_properties WHERE ${filters}) AS pp
      ON pp.product_id = pi.product_id AND pp.source_id = pi.source_id
    INNER JOIN
      (SELECT id, name FROM properties WHERE name IN
        ('KHUB', 'KHUB MINUS', 'KHUB PLUS', 'KHUB MAX', 'KHUB SUPER MAXX',
        'KHUB ON RANGE DATE', 'KHUB OFF RANGE DATE')) AS p
      ON p.id = pp.property_id`,
    { type: Sequelize.QueryTypes.SELECT, raw: true })
}
