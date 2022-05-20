const highland = require('highland')
const { groupBy } = require('lodash')
const moment = require('moment-timezone')
const { getTaggedProductsList, getTaggedProductsCount, fetchProductInfoStream, bulkCreate } = require('../lib/repositories/product-info-v2-repository')
const { logger } = require('./logger.service')
const { logSourceInfo } = require('../config')
const { extractProductStatus } = require('../lib/exports/helper')
const { getProductFilters } = require('../util/tagged-products')
const { propertiesMapping } = require('../config/tagged-data')
const { extractPeriodCalendar } = require('../lib/exports/helper')
const { getPeriodStartDate } = require('../util/calendar')
const { validateProduct } = require('../lib/dss/export-validations')

const getTaggedProducts = async ({ limit, page, type, associatedDepartments, sortData, filters, searchText }) => {
  try {
    let products
    let skip = (page - 1) * limit
    let productFilters = getProductFilters({ type, associatedDepartments, filters, searchText })
    let calculatedTotal = await getTaggedProductsCount(productFilters)
    calculatedTotal = parseInt(calculatedTotal?.[0]?.count)

    let totalPages = Math.ceil(calculatedTotal / limit)
    if ((calculatedTotal > (limit * 4)) && (page > (totalPages / 2))) {
      /*
        When records increase, pagination is very slow for last few pages.
        To overcome that, reverse the sort order for second half pages.
        That way, to get last page data, no need to skip the entire dataset.
      */
      sortData = 'created_on ASC'
      let desiredPage = totalPages - page
      let lastPageCount = calculatedTotal - ((totalPages - 1) * limit)
      if (desiredPage === 0) {
        skip = 0
        limit = lastPageCount
      } else {
        skip = ((desiredPage - 1) * limit) + lastPageCount
      }
    }

    products = calculatedTotal > 0 ? await getTaggedProductsList({ limit, skip, sortData, productFilters }) : []

    if (products?.length > 0) {
      let periodData = await extractPeriodCalendar()
      products = formResponseData(products, periodData)
    } else {
      products = []
    }
    return { products: products, total: calculatedTotal }
  } catch (err) {
    logger.error({ err, ...logSourceInfo('OTHERS') }, 'Getting tagged products failed')
    throw new Error('Getting tagged products failed')
  }
}

const formResponseData = (products, periodData) => {
  products = groupByProductSourceId(products, periodData)
  return products.map((p) => {
    let product = getKeycodeAndStyleNumber(p)
    product = formatTaggedData(product)
    if (product?.status_code) {
      product.status_code.australia = extractProductStatus(product.status_code?.australia)
      product.status_code.newZealand = extractProductStatus(product.status_code?.newZealand)
    }
    if (product?.exclusions) {
      product.exclusions = formatExclusions(product.exclusions)
    }
    return product
  })
}

const groupByProductSourceId = (products, periodData) => {
  let groupedProducts = groupBy(products, d => d.product_id + ':' + d.source_id)

  return Object.keys(groupedProducts).map(groupKey => {
    let { itemNo, itemDescription, sell_price, has_country_variations, country_variations_properties,
      has_climatic_variations, climatic_variations_properties, has_state_variations, state_variations_properties,
      core_on_range_date, core_off_range_date, core_on_range_period, core_off_range_period,
      plan_c, non_plan_c, small_fleet, online_only, aws, lspl, ...product } = groupedProducts[groupKey][0]
    let product_source_id = `${product.product_id}${product.source_id}`
    product = {
      product_source_id: product_source_id,
      _id: product_source_id,
      dssProduct: {
        itemNo,
        itemDescription
      },
      tagged_data: {
        kmart: {
          core_on_range_date,
          core_off_range_date,
          core_on_range_period,
          core_off_range_period,
          plan_c,
          non_plan_c,
          small_fleet,
          online_only,
          aws,
          lspl
        }
      },
      tagged_data_variations: {
        has_country_variations,
        country_variations_properties: country_variations_properties || { aus: { ranged: true }, nzl: { ranged: true } },
        has_climatic_variations,
        climatic_variations_properties: climatic_variations_properties || { far_north: { ranged: true }, north: { ranged: true }, south: { ranged: true } },
        has_state_variations,
        state_variations_properties
      },
      ...sell_price,
      ...product
    }
    let khub = {}
    groupedProducts[groupKey].map(group => {
      khub[propertiesMapping[group.name]] = group.property_value
      if (group.name === 'KHUB ON RANGE DATE') {
        khub['khub_on_range_date'] = getPeriodStartDate(group.property_value, periodData)
      } else if (group.name === 'KHUB OFF RANGE DATE') {
        khub['khub_off_range_date'] = getPeriodStartDate(group.property_value, periodData)
      }
    })
    product.tagged_data.khub = khub
    return product
  })
}

const getKeycodeAndStyleNumber = (product) => {
  if (product.keycode_type?.toLowerCase() === 'single') {
    product.keycode = product.keycodes?.[0] || null
    product.styleNumber = null
  } else if (product.keycode_type?.toLowerCase() === 'style') {
    product.keycode = null
  } else {
    product.keycode = null
    product.styleNumber = null
  }
  return product
}

const formatTaggedData = (product) => {
  if (!(product.tagged_data.kmart?.core_on_range_date || product.tagged_data.kmart?.core_on_range_date === '')) {
    product.tagged_data.kmart.core_on_range_date = product.core_range_dates.core_on_range_date
    product.tagged_data.kmart.core_on_range_period = product.core_range_dates.core_on_range_period
  }
  if (!(product.tagged_data.kmart?.core_off_range_date || product.tagged_data.kmart?.core_off_range_date === '')) {
    product.tagged_data.kmart.core_off_range_date = product.core_range_dates.core_off_range_date
    product.tagged_data.kmart.core_off_range_period = product.core_range_dates.core_off_range_period
  }
  return product
}

const formatExclusions = (exclusions) => {
  if (exclusions.khub) {
    Object.keys(exclusions.khub).map((key) => {
      let data = exclusions.khub[key]
      exclusions.khub[key] = (data.excluded && moment().isBetween(data.effectiveDate, data.expiryDate)) ? true : false
    })
  }
  if (exclusions.kmart) {
    Object.keys(exclusions.kmart).map((key) => {
      let data = exclusions.kmart[key]
      exclusions.kmart[key] = (data.excluded && moment().isBetween(data.effectiveDate, data.expiryDate)) ? true : false
    })
  }
  return exclusions
}

const updateValidProductInfo = async () => {
  const stream = await fetchProductInfoStream()
  return highland(stream)
    .batch(1000)
    .map(data => getValidProductInfo(data))
    .flatMap(validProductInfo => highland(bulkCreate(validProductInfo, ['isValidProduct'])))
    .errors(errors => {
      logger.error(errors)
    })
    .done(() => {
      logger.info('Update of validProduct info completed')
    })
}

const getValidProductInfo = (data) => {
  return data.map(row => {
    let isValidProduct = validateProduct(row)
    return {
      isValidProduct,
      productId: row.product_id,
      sourceId: row.source_id,
      isRegistered: row.is_registered,
      productData: row.product_data,
      productMetadata: row.product_metadata,
      type: row.type,
      updatedAt: row.updated_at,
      exclusions: row.exclusions,
      year: row.year,
      isDcReplenished: row.is_dc_replenished,
      family_id: row.family_id
    }
  })
}

module.exports = {
  getTaggedProducts,
  updateValidProductInfo
}
