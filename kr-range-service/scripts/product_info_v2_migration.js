/* eslint-disable no-async-promise-executor */
const highland = require('highland')
const moment = require('moment-timezone')
const { pgClose } = require('../src/db')
const { logger } = require('../src/service/logger.service')
const { bulkCreate } = require('../src/lib/repositories/product-info-v2-repository')
const { fetchDataStream } = require('../src/util/db_stream')

const eventToDbModel = async (row) => {
  const { product_id, source_id, keycode_type, style_number, dss_item_number, primary_color, secondary_color,
    keycode, is_registered, product_data, product_metadata, type, is_valid_product, exclusions, description,
    status_code, department_code, year, season, sell_price, fixture_type, is_dc_replenished, instore_presentation,
    replenishment_method, keycodes, core_range_dates, created_on, family_id, image_url
  } = row

  console.log('productId', product_id)
  console.log('sourceId', source_id)

  let dbModel = {
    productId: product_id,
    sourceId: source_id,
    keycodeType: keycode_type || null,
    styleNumber: style_number || null,
    dssItemNumber: dss_item_number || null,
    primaryColor: primary_color || null,
    secondaryColor: secondary_color || null,
    keycode: keycode || null,
    isRegistered: is_registered,
    productData: product_data,
    productMetadata: product_metadata,
    type: type,
    updatedAt: moment().toISOString(),
    isValidProduct: is_valid_product,
    exclusions: exclusions || null,
    description: description || null,
    statusCode: status_code || null,
    departmentCode: department_code || null,
    year: year || null,
    season: season || null,
    sellPrice: sell_price,
    fixtureType: fixture_type || null,
    isDcReplenished: is_dc_replenished,
    instorePresentation: instore_presentation || null,
    replenishmentMethod: replenishment_method || null,
    keycodes: keycodes || null,
    core_range_dates: core_range_dates || null,
    createdOn: created_on || null,
    family_id: family_id,
    familyName: product_data?.familyTree?.family?.name?.toUpperCase() || null,
    className: product_data?.familyTree?.class?.name?.toUpperCase() || null,
    subClassName: product_data?.familyTree?.subClass?.name?.toUpperCase() || null,
    subSubClassName: product_data?.familyTree?.subSubClass?.name?.toUpperCase() || null,
    imageUrl: image_url || null
  }

  return dbModel
}

const transformRow = async (row) => {
  return new Promise(async (resolve) => {
    const data = await Promise.all(row.map(async (record) => {
      return eventToDbModel(record)
    }))
    resolve(data)
  })
}

const insertRows = async (rows) => {
  try {
    const updateFields = [
      'familyName', 'className', 'subClassName', 'subSubClassName', 'updatedAt'
    ]
    await bulkCreate(rows, updateFields)
  } catch (error) {
    logger.error('Error inserting to product info v2')
  }
}


const main = async () => {
  try {
    const sql = 'select * from product_info_v2;'
    const stream = await fetchDataStream(sql, true)

    highland(stream)
      .batch(1000)
      .flatMap(row => highland(transformRow(row)))
      .flatMap(data => highland(insertRows(data)))
      .errors(error => {
        logger.error('Error migrating product info v2 ', error)
      })
      .done(async () => {
        logger.info('Migration of product info v2 completed')
        pgClose()
      })
  } catch (error) {
    logger.error(error)
  }
}

main()

module.exports = main
