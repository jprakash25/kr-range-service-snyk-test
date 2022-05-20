const { getProductProperties } = require('./../repositories/product-properties-repository')
const _ = require('lodash')
const memoizee = require('memoizee')
const { getPeriodCalendar } = require('./../repositories/period-calendar-repository')
const { getPeriodStartDate } = require('../../util/calendar')
const { logger } = require('./../../service/logger.service')
const periodCalendarProcessor = require('./../input-sources/calendar/period_calendar_processor')

/*
  60 mins expiry
  prefetch when 20 mins (default 33%) of expiry time is left
*/
let memoizedGetPeriodCalendar = memoizee(getPeriodCalendar, { maxAge: 60 * 60 * 1000, prefetch: true })

const extractRangeDataProperties = async (products, rangeProperties) => {
  const productsIdList = []
  const sourceIdList = []
  products.map((product) => {
    productsIdList.push(product.product_id) // option Id
    sourceIdList.push(product.source_id) // DSS Ref numbers
  })
  const propertyIdList = rangeProperties.map((property) => property.id)

  const productPropertiesArr = await getProductProperties({ propertyIdList, productsIdList, sourceIdList })

  let productRangeProperties
  let productProperty

  const productWithRangeData = products.map((product) => {
    productRangeProperties = _.filter(productPropertiesArr, (r) => (r.productId === product.product_id &&
      r.sourceId === product.source_id))

    product.range_data = {}
    productRangeProperties.forEach((rangedProperty) => {
      productProperty = _.find(rangeProperties, (property) => property.id == rangedProperty.propertyId)
      product.range_data[productProperty.name] = rangedProperty.propertyValue
    })

    return product
  })

  return productWithRangeData
}

const extractPeriodCalendar = async () => {
  let periodCalendar = await memoizedGetPeriodCalendar()
  if (!periodCalendar || periodCalendar.length == 0) {
    logger.info('Reloading Period calendar data as it is not found in DB')
    await periodCalendarProcessor.parseAndStorePeriodCalendarData()
    memoizedGetPeriodCalendar.clear()
    periodCalendar = await memoizedGetPeriodCalendar()
  }
  return periodCalendar
}

const addAdditionalFields = (params) => {
  const { channel, periodList, data } = params
  const { periodCalendar } = periodList
  if (channel === 'khub') {
    return data.map(d => {
      const { range_data } = d
      d.khub_on_range_date_format = getPeriodStartDate(range_data['KHUB ON RANGE DATE'], periodCalendar)
      d.khub_off_range_date_format = getPeriodStartDate(range_data['KHUB OFF RANGE DATE'], periodCalendar)
      d.khub_northern_on_range_date_format = getPeriodStartDate(range_data['KHUB NORTHERN ON RANGE DATES'], periodCalendar)
      d.khub_northern_off_range_date_format = getPeriodStartDate(range_data['KHUB NORTHERN OFF RANGE DATES'], periodCalendar)
      d.khub_southern_on_range_date_format = getPeriodStartDate(range_data['KHUB SOUTHERN ON RANGE DATES'], periodCalendar)
      d.khub_southern_off_range_date_format = getPeriodStartDate(range_data['KHUB SOUTHERN OFF RANGE DATES'], periodCalendar)
      return d
    })
  } else if (channel === 'kmart') {
    return data.map(d => {
      const { range_data } = d
      d.kmart_on_range_date_format = getPeriodStartDate(range_data['ON RANGE DATE'], periodCalendar)
      d.kmart_off_range_date_format = getPeriodStartDate(range_data['OFF RANGE DATE'], periodCalendar)
      d.kmart_northern_on_range_date_format = getPeriodStartDate(range_data['NORTHERN ON RANGE DATES'], periodCalendar)
      d.kmart_northern_off_range_date_format = getPeriodStartDate(range_data['NORTHERN OFF RANGE DATES'], periodCalendar)
      d.kmart_southern_on_range_date_format = getPeriodStartDate(range_data['SOUTHERN ON RANGE DATES'], periodCalendar)
      d.kmart_southern_off_range_date_format = getPeriodStartDate(range_data['SOUTHERN OFF RANGE DATES'], periodCalendar)
      return d
    })
  }
}

const extractProductStatus = (statusCodes) => {
  const uniqueStatusCodes = new Set(statusCodes)
  if (uniqueStatusCodes.size <= 1) return statusCodes[0] ? statusCodes[0] : ''
  const statusCodesWithFrequency = _.countBy(statusCodes)
  const statusCodeWithMaximumFrequency = Object.keys(statusCodesWithFrequency).reduce((a, b) => statusCodesWithFrequency[a] > statusCodesWithFrequency[b] ? a : b)
  const maxFrequency = statusCodesWithFrequency[statusCodeWithMaximumFrequency]
  const frequenciesOfFrequency = _.countBy(Object.values(statusCodesWithFrequency))
  return frequenciesOfFrequency[maxFrequency] > 1 ? '' : statusCodeWithMaximumFrequency
}

module.exports = {
  extractRangeDataProperties,
  extractPeriodCalendar,
  addAdditionalFields,
  extractProductStatus
}
