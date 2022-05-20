const moment = require('moment-timezone')
const Sequelize = require('sequelize')
const models = require('../models')
const db = require('../../db')
const { fetchDataStream } = require('../../util/db_stream')

exports.saveProductInfoV2 = async (productModel, transactionId = null) => {
  const { product_info_v2 } = models()
  const options = {}
  if (transactionId) {
    options.transactionId = transactionId
  }
  return product_info_v2.create(productModel, options)
}

exports.updateImageUrl = async (dssRefNo, data) => {
  const { product_info_v2 } = models()
  const options = {
    where: {
      sourceId: dssRefNo
    },
    returning: true,
    plain: true
  }
  return product_info_v2.update(data, options)
}

exports.deleteProductInfoV2BySourceId = async (sourceId, transaction = null) => {
  const { product_info_v2 } = models()
  const options = {
    where: {
      sourceId
    }
  }
  if (transaction) {
    options.transaction = transaction
  }
  return product_info_v2.destroy(options)
}

exports.isLatestEvent = async (sourceId, updated_date) => {
  const { product_info_v2 } = models()
  const updatedEventTime = moment(updated_date).utc()
  const latestEvent = await product_info_v2.findAll({
    attributes: [
      'sourceId',
      [Sequelize.literal('max((product_metadata->>\'timestamp\')::timestamp AT TIME ZONE \'UTC\')'), 'latest_event_date']
    ],
    where: {
      sourceId
    },
    group: ['source_id'],
    raw: true
  })

  return latestEvent[0] ? updatedEventTime.isSameOrAfter(moment(latestEvent[0].latest_event_date)) : true
}

exports.bulkCreate = async (productInfoModel, updateFields) => {
  const { product_info_v2 } = models()
  const options = {
    fields: [
      'productId', 'sourceId', 'keycodeType', 'styleNumber', 'dssItemNumber', 'primaryColor', 'secondaryColor',
      'keycode', 'isRegistered', 'productData', 'productMetadata', 'type', 'updatedAt', 'isValidProduct',
      'exclusions', 'description', 'statusCode', 'departmentCode', 'year', 'season', 'sellPrice', 'coreRangeDates',
      'fixtureType', 'isDcReplenished', 'instorePresentation', 'replenishmentMethod', 'keycodes', 'createdOn', 'family_id',
      'familyName', 'className', 'subClassName', 'subSubClassName', 'imageUrl'
    ],
    updateOnDuplicate: updateFields
  }
  return product_info_v2.bulkCreate(productInfoModel, options)
}

exports.getProductIdsBySourceId = async (sourceId) => {
  const { product_info_v2 } = models()
  const productIds = await product_info_v2.findAll({
    attributes: [
      'productId'
    ],
    where: {
      sourceId
    },
    raw: true
  })

  return productIds.map(ids => ids.productId)
}

exports.findProductBy = async (data) => {
  const { product_info_v2 } = models()
  const params = { raw: true }
  if (data) {
    params.where = data
  }

  return product_info_v2.findOne(params)
}

exports.getTaggedProductsCount = async (filters) => {
  return db.getDB().query(`SELECT count(id) FROM product_info_v2 WHERE ${filters}`,
    { type: Sequelize.QueryTypes.SELECT, raw: true })
}

exports.getDistinctYear = async () => {
  const { product_info_v2 } = models()
  return product_info_v2.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('year')), 'year']
    ],
    where: {
      isValidProduct: true
    },
    raw: true
  })
}

exports.getTaggedProductsList = async (data) => {
  const { limit, skip, sortData, productFilters } = data
  return db.getDB().query(`
    SELECT pi.product_id, pi.source_id, pi.type,
      p.name, pp.property_value, kpp.core_on_range_date,  kpp.core_off_range_date, kpp.core_off_range_period,
      kpp.core_on_range_period, kpp.plan_c, kpp.non_plan_c, kpp.small_fleet, kpp.online_only, kpp.lspl,
      kpp.aws, pi.keycode_type, pi.style_number "styleNumber", pi.keycodes, pi.status_code,
      pi.primary_color "primaryColour_name", pi.secondary_color "secondaryColour_name", pi.department_code,
      pi.dss_item_number "itemNo", pi.description "itemDescription", pi.is_dc_replenished "isDcReplenished",
      pi.instore_presentation "instorePresentation_name", pi.fixture_type "fixtureType_name",
      pi.sell_price, pi.core_range_dates, pi.exclusions, pi.created_on,
      pi.family_name, pi.class_name, pi.sub_class_name subclass_name, pi.image_url "imageUrl",
      tpv.has_country_variations, tpv.country_variations_properties, tpv.has_climatic_variations,
      tpv.climatic_variations_properties, tpv.has_state_variations, tpv.state_variations_properties
    FROM product_properties pp
    INNER JOIN
      (SELECT id, name FROM properties WHERE name IN
        ('KHUB', 'KHUB MINUS', 'KHUB PLUS', 'KHUB MAX', 'KHUB SUPER MAXX',
        'KHUB ON RANGE DATE', 'KHUB OFF RANGE DATE', 'LSPL')) AS p
      ON p.id = pp.property_id
    RIGHT JOIN
      (SELECT * FROM product_info_v2 WHERE ${productFilters}
      ORDER BY ${sortData} LIMIT ${limit} OFFSET ${skip}) AS pi
      ON pp.product_id = pi.product_id AND pp.source_id = pi.source_id
    LEFT JOIN
      (SELECT * FROM kmart_product_properties) kpp
      ON pi.source_id = kpp.source_id AND pi.product_id = kpp.product_id
    LEFT JOIN
      (SELECT * FROM tagged_properties_variations) tpv
      ON pi.source_id = tpv.source_id AND pi.product_id = tpv.product_id`,
    { type: Sequelize.QueryTypes.SELECT, raw: true })
}

exports.fetchProductInfoStream = async () => {
  const sql = 'select * from product_info_v2;'
  return fetchDataStream(sql)
}
