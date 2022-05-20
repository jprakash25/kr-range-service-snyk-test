const db = require('../db')
const { getProductIdsBySourceId, deleteProductInfoV2BySourceId } = require('../lib/repositories/product-info-v2-repository')
const { deleteProductPropertiesByProductIds } = require('../lib/repositories/product-properties-repository')
const { logger } = require('./logger.service')
const { logSourceInfo } = require('../config')
const deleteProductsBySourceId = async (sourceId) => {
  try {
    const productIds = await getProductIdsBySourceId(sourceId)
    if (productIds && productIds.length > 0) {
      const sequelize = db.getDB()
      return sequelize.transaction().then((t) => {
        return deleteProductPropertiesByProductIds(productIds, sourceId, t).then(function () {
          return deleteProductInfoV2BySourceId(sourceId, t)
        }).then(function () {
          return t.commit()
        }).catch(async (err) => {
          logger.error(err, 'The transaction was failed and rolled back')
          await t.rollback()
          throw new Error(`${err}: The transaction was failed and rolled back`)
        })
      })
    } else {
      logger.info({ sourceId }, 'No products found')
      return { message: 'No products found' }
    }
  } catch (err) {
    logger.error({ err, ...logSourceInfo('CDS_DATA_PROCESSING') }, 'Error while deleting products by source ID')
    return false
  }
}

module.exports = {
  deleteProductsBySourceId
}
