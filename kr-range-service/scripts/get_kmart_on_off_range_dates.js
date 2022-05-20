#!/usr/bin/env node
const highland = require('highland')
const csv = require('fast-csv')
const { logger } = require('../src/service/logger.service')
const { S3 } = require('../src/lib/aws')
const { rangeServiceInfoBucket } = require('../src/config')
const { getOnOffRangePeriod } = require('../src/lib/exports/validations')
const { extractPeriodCalendar } = require('../src/lib/exports/helper')
const { fetchDataStream } = require('../src/util/db_stream')

const fetchReportStream = async () => {
  let startDate = process.argv[2]
  let endDate = process.argv[3]

  if (!startDate || !endDate) {
    logger.info('Start date and End date should be provided as input arguments')
    return undefined
  } else {
    const sql = `SELECT product_id, source_id, type, primary_color, secondary_color, keycode,
    product_data -> 'ipm_on_range' as ipm_on_range,
    product_data -> 'ipm_off_range' as ipm_off_range,
    product_data -> 'bp_on_range' as bp_on_range,
    product_data -> 'bp_off_range' as bp_off_range from product_info_v2
    WHERE ((TO_DATE(product_data ->> 'ipm_on_range', 'DD/MM/YYYY') < TO_DATE('${endDate}', 'DD/MM/YYYY')
          AND ((product_data ->> 'ipm_on_range') <> '') IS TRUE)
    AND (TO_DATE(product_data ->> 'ipm_off_range', 'DD/MM/YYYY') > TO_DATE('${startDate}', 'DD/MM/YYYY')
        OR product_data ->> 'ipm_off_range' = null
        OR product_data ->> 'ipm_off_range' = '' ))
    OR ((TO_DATE(product_data ->> 'bp_on_range', 'DD/MM/YYYY') < TO_DATE('${endDate}', 'DD/MM/YYYY')
          AND ((product_data ->> 'bp_on_range') <> '') IS TRUE)
    AND (TO_DATE(product_data ->> 'bp_off_range', 'DD/MM/YYYY') > TO_DATE('${startDate}', 'DD/MM/YYYY')
        OR product_data ->> 'bp_off_range' = null
        OR product_data ->> 'bp_off_range' = '' ) );`

    logger.info({ sqlStmt: sql }, 'SQL Query for export')
    return fetchDataStream(sql, true)
  }
}

const main = async () => {
  try {
    let totalEvent = 0
    const stream = await fetchReportStream()
    const periodCalendar = await extractPeriodCalendar()
    let periodList = {
      periodCalendar,
      dateFound: {}
    }
    let kmartData = []

    if (stream) {
      logger.info('Starting stream')
      const filename = `kmart-on-off-range-dates-${Date.now()}.csv`

      highland(stream)
        .map(data => {
          totalEvent = totalEvent + 1
          return data
        })
        .map(data => {
          let productInfo = {
            dss_ref_no: data.source_id,
            option_id: data.product_id,
            keycode: data.keycode,
            primary_color: data.primary_color,
            secondary_color: data.secondary_color
          }
          if (data.type === 'AP') {
            productInfo.on_range = data.bp_on_range
            productInfo.off_range = data.bp_off_range
          } else {
            productInfo.on_range = data.ipm_on_range
            productInfo.off_range = data.ipm_off_range
          }
          productInfo.on_range_period = getOnOffRangePeriod(productInfo.on_range, periodList)
          productInfo.off_range_period = getOnOffRangePeriod(productInfo.off_range, periodList)
          kmartData.push(productInfo)
          return productInfo
        })
        .errors(errors => logger.error({ errors }, 'Error: send product info'))
        .done(async () => {
          const csvHeaders = Object.keys(kmartData[0])
          kmartData.unshift(csvHeaders)
          logger.info({ totalEvent }, 'Transfering data is finished')
          logger.info({ bucket: rangeServiceInfoBucket, key: `kris/data/${filename}` }, 'Publishing Kmart on/off range dates')
          S3.upload(rangeServiceInfoBucket, `kris/data/${filename}`, csv.write(kmartData, { headers: true }))
        })
    }
  } catch (err) {
    logger.error('Error while publishing Kmart on/off range dates', err)
  }
}

main()
