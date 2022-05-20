const { get } = require('lodash')
const { logger } = require('../../service/logger.service')
const { logSourceInfo } = require('../../config')
const { extractProductStatus } = require('../exports/helper')
const getDefaultSourcingRecord = (data) => {
  const sourcingRecord = data.sourcingRecords?.find(record => record.isDefaultSourcingRecord) || {}
  const quote = get(sourcingRecord, 'quotes[0]')
  return {
    ...sourcingRecord,
    quote
  }
}

const getColumnsData = channel => ({
  RBU: 'product_data.rbu.rbuName',
  'Department number': 'product_data.familyTree.department.code',
  'Department name': 'product_data.familyTree.department.name',
  'Family name': 'product_data.familyTree.family.name',
  'Class name': 'product_data.familyTree.class.name',
  'Sub class name': 'product_data.familyTree.subClass.name',
  'Kmart Style ID': 'product_data.styleNumber',
  Keycode: (params) => {
    const sizes = get(params, 'data.product_data.option.sizes', [])
    const keycodes = sizes.map((s) => get(s, 'keycodeNumber', '')).filter(Boolean)
    return keycodes.length == 1 ? keycodes[0] : ''
  },
  'DSS item no': 'product_data.dssProduct.itemNo',
  'DSS ref no': 'product_data.dssProduct.refNo',
  'Abbreviated description': 'product_data.abbreviatedDescription',
  'Primary Color': 'product_data.option.primaryColour.name',
  'Secondary Color': 'product_data.option.secondaryColour.name',
  'Colour description': 'product_data.option.colourDescription',
  'AUS product status code': (params) => {
    const sizes = get(params, 'data.product_data.option.sizes', [])
    const statusCodes = sizes.map((s) => get(s, 'productStatus.australia.code', '')).filter(Boolean)
    return extractProductStatus(statusCodes)
  },
  'Replenishment method': 'product_data.replenishmentMethod.name',
  Year: 'product_data.year',
  'Season name': 'product_data.season.name',
  'AUS Sell Price (Inc GST)': 'product_data.currentSourcingSummary.destinationCostAndSell.australia.sellPriceIncGst',
  'Fixture Type': 'product_data.fixtureType.name',
  'Instore presentation': 'product_data.instorePresentation.name',
  'Price Tiering': 'product_data.priceTiering.name',
  'IPM On Range': 'product_data.ipm_on_range',
  'IPM Off Range': 'product_data.ipm_off_range',
  'IPM On Range Period': 'product_data.ipm_on_range_period',
  'IPM Off Range Period': 'product_data.ipm_off_range_period',
  'Buyplan On Range': 'product_data.bp_on_range',
  'Buyplan Off Range': 'product_data.bp_off_range',
  'Buyplan On Range Period': 'product_data.bp_on_range_period',
  'Buyplan Off Range Period': 'product_data.bp_off_range_period',
  ...(channel === 'khub' && {
    'KHUB MINUS': 'range_data["KHUB MINUS"]',
    'KHUB': 'range_data["KHUB"]',
    'KHUB PLUS': 'range_data["KHUB PLUS"]',
    'KHUB MAX': 'range_data["KHUB MAX"]',
    'KHUB SUPER MAXX': 'range_data["KHUB SUPER MAXX"]',
    'KHUB ON RANGE DATE (DATE FORMAT)': 'khub_on_range_date_format',
    'KHUB OFF RANGE DATE (DATE FORMAT)': 'khub_off_range_date_format',
    'KHUB NORTHERN ON RANGE DATES (DATE FORMAT)': 'khub_northern_on_range_date_format',
    'KHUB NORTHERN OFF RANGE DATES (DATE FORMAT)': 'khub_northern_off_range_date_format',
    'KHUB SOUTHERN ON RANGE DATES (DATE FORMAT)': 'khub_southern_on_range_date_format',
    'KHUB SOUTHERN OFF RANGE DATES (DATE FORMAT)': 'khub_southern_off_range_date_format',
    'KHUB ON RANGE DATE': 'range_data["KHUB ON RANGE DATE"]',
    'KHUB OFF RANGE DATE': 'range_data["KHUB OFF RANGE DATE"]',
    'KHUB NORTHERN ON RANGE DATES': 'range_data["KHUB NORTHERN ON RANGE DATES"]',
    'KHUB NORTHERN OFF RANGE DATES': 'range_data["KHUB NORTHERN OFF RANGE DATES"]',
    'KHUB SOUTHERN ON RANGE DATES': 'range_data["KHUB SOUTHERN ON RANGE DATES"]',
    'KHUB SOUTHERN OFF RANGE DATES': 'range_data["KHUB SOUTHERN OFF RANGE DATES"]'
  }),
  ...(channel === 'kmart' && {
    'FLEET': 'range_data["FLEET"]',
    'SMALL FLEET': 'range_data["SMALL FLEET"]',
    'ONLINE': 'range_data["ONLINE"]',
    'ON RANGE DATE (DATE FORMAT)': 'kmart_on_range_date_format',
    'OFF RANGE DATE (DATE FORMAT)': 'kmart_off_range_date_format',
    'NORTHERN ON RANGE DATES (DATE FORMAT)': 'kmart_northern_on_range_date_format',
    'NORTHERN OFF RANGE DATES (DATE FORMAT)': 'kmart_northern_off_range_date_format',
    'SOUTHERN ON RANGE DATES (DATE FORMAT)': 'kmart_southern_on_range_date_format',
    'SOUTHERN OFF RANGE DATES (DATE FORMAT)': 'kmart_southern_off_range_date_format',
    'ON RANGE DATE': 'range_data["ON RANGE DATE"]',
    'OFF RANGE DATE': 'range_data["OFF RANGE DATE"]',
    'NORTHERN ON RANGE DATES': 'range_data["NORTHERN ON RANGE DATES"]',
    'NORTHERN OFF RANGE DATES': 'range_data["NORTHERN OFF RANGE DATES"]',
    'SOUTHERN ON RANGE DATES': 'range_data["SOUTHERN ON RANGE DATES"]',
    'SOUTHERN OFF RANGE DATES': 'range_data["SOUTHERN OFF RANGE DATES"]'
  })
})

const excludedColumns = {
  AP: ['IPM On Range', 'IPM Off Range', 'IPM On Range Period', 'IPM Off Range Period'],
  GM: ['Buyplan On Range', 'Buyplan Off Range', 'Buyplan On Range Period', 'Buyplan Off Range Period']
}

const isValidColumn = (columnHead, reportType) => {
  return excludedColumns[reportType] ? !excludedColumns[reportType].includes(columnHead) : true
}

exports.exportReportMapper = (params) => {
  try {
    const { data, reportType, channel } = params
    return data.map(d => {
      const result = {}
      const sourcingRecord = getDefaultSourcingRecord(d.product_data)
      const columnsData = getColumnsData(channel)

      Object.keys(columnsData).map((columnHead) => {
        let val = ''
        const columnData = columnsData[columnHead]
        if (isValidColumn(columnHead, reportType)) {
          if (typeof columnData === 'string') {
            val = get(d, columnData, '')
          } else if (typeof columnData === 'function') {
            val = columnData({ ...params, data: d, sourcingRecord })
          }
          result[columnHead] = val != null || val != undefined ? val : ''
        }
      })
      return result
    })
  } catch (err) {
    logger.error({ err, ...logSourceInfo('EXPORT') }, 'Error on dss report mapper')
    throw err
  }
}
