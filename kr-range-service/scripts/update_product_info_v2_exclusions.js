const highland = require('highland')
const { logger } = require('../src/service/logger.service')
const { getExclusions } = require('../src/lib/rules/whitelist-blacklist')
const { findBlacklistWhitelistByChannels } = require('../src/lib/repositories/upload-blacklist-whitelist-repository')
const { getStoreFormatsOnChannel } = require('../src/config/tagged-data')
const { fetchDataStream } = require('../src/util/db_stream')
const { bulkCreate } = require('../src/lib/repositories/product-info-v2-repository')

const updateExclusions = async (exclusionsInfo) => {
  return bulkCreate(exclusionsInfo, ['exclusions'])
}

const getExclusionsInfo = (row, blacklistData) => {
  const { familyTree } = row?.product_data
  const exclusions = getExclusions({
    department_code: row?.department_code,
    family_code: familyTree?.family?.code,
    class_code: familyTree?.class?.code,
    subclass_code: familyTree?.subClass?.code,
    subSubClass_code: familyTree?.subSubClass?.code
  }, blacklistData)
  return {
    exclusions,
    productId: row.product_id,
    sourceId: row.source_id,
    isRegistered: row.is_registered,
    productData: row.product_data,
    productMetadata: row.product_metadata,
    type: row.type,
    updatedAt: row.updated_at,
    isValidProduct: row.is_valid_product,
    year: row.year,
    isDcReplenished: row.is_dc_replenished,
    family_id: row.family_id
  }
}

const main = async () => {
  try {
    logger.info('Starting update of exclusion')
    const storeChannels = getStoreFormatsOnChannel()['khub'].concat(getStoreFormatsOnChannel()['kmart'])
    const whitelistBlacklistData = await findBlacklistWhitelistByChannels(storeChannels)
    const blacklistData = whitelistBlacklistData.filter((ele) => ele.isBlacklisted)
    const sql = 'select * from product_info_v2;'
    const stream = await fetchDataStream(sql)
    highland(stream)
      .batch(1000)
      .map(data => data.map((row) => getExclusionsInfo(row, blacklistData)))
      .flatMap(exclusionsInfo => highland(updateExclusions(exclusionsInfo)))
      .errors(errors => {
        logger.error(errors)
      })
      .done(async () => {
        logger.info('Update of exclusions completed')
      })
  } catch (error) {
    logger.error(error)
  }
}

main()

module.exports = main
