const highland = require('highland')
const csv = require('fast-csv')
const zlib = require('zlib')
const { Op } = require('sequelize')
const { S3 } = require('../lib/aws')
const { exportReportMapper } = require('../lib/dss/export-mapper')
const { logger } = require('./logger.service')
const { validateProduct } = require('../lib/dss/export-validations')
const { getEditableProperties } = require('./properties.service')
const { extractRangeDataProperties, extractPeriodCalendar, addAdditionalFields } = require('./../lib/exports/helper')
const {
  upsertExportReport,
  getExportReportById,
  getExportReports,
  getExportReportsCount
} = require('../lib/repositories/export-report-repository')
const { upsertExportReportMetaData } = require('../lib/repositories/export-report-metadata-repository')
const { logSourceInfo } = require('../config')
const { fetchDataStream } = require('../util/db_stream')

const fetchReportStream = async (options) => {
  const reportType = options.type
  const channel = options.channel
  let sql = 'SELECT * FROM product_info_v2'
  if (reportType != 'ALL') {
    sql += ` WHERE type='${reportType.toUpperCase()}'`
  }

  const rangeProperties = await getEditableProperties(channel)
  logger.info({ sqlStmt: sql }, 'SQL Query for export')
  const stream = await fetchDataStream(sql)

  const periodCalendar = await extractPeriodCalendar()
  let periodList = {
    periodCalendar,
    dateFound: {}
  }

  return highland(stream)
    .filter(data => validateProduct(data))
    .batch(100)
    .flatMap(data => highland(extractRangeDataProperties(data, rangeProperties)))
    .map(data => addAdditionalFields({ data, periodList, channel }))
    .flatMap(data => exportReportMapper({ data, reportType, channel }))
    .errors(errors => logger.error({ errors }, 'Error: export data'))
    .compact()
}

class ProductExportService {

  exportBucketName = process.env.RANGE_EXPORT_BUCKET_NAME
  csvStream = csv.format({ headers: true })

  generateFileKey(exportReportData) {
    const { id, type, channel } = exportReportData
    return `${channel}-${type.toLowerCase()}-product-info-${id}`
  }

  async initExport(options) {
    return upsertExportReport({
      type: options.type,
      channel: options.channel,
      startTime: new Date().getTime(),
      status: 'process'
    })
  }

  async upload(uid) {
    try {
      const exportReportData = await this.getExportReportById(uid)

      const { type, channel } = exportReportData
      const filekey = this.generateFileKey(exportReportData)
      const filename = `${filekey}.csv.gz`
      logger.info({ filekey, type, channel }, 'Export started')

      // S3 streaming
      const { writeStream, uploadCompletePromise } = S3.uploadStream(this.exportBucketName, filename)
      const csvStream = csv.format({ headers: true })
      const gzip = zlib.createGzip()

      // Fetch data streaming
      const reportStream = await fetchReportStream(exportReportData)
      reportStream
        .pipe(csvStream)
        .pipe(gzip)
        .pipe(writeStream)

      const s3Data = await uploadCompletePromise
      const downloadedDate = new Date()
      logger.info({ filekey, s3Data }, 'Export finished')

      return Promise.all([
        upsertExportReport({
          ...exportReportData,
          endTime: downloadedDate.getTime(),
          status: 'completed',
          s3Data
        })],
        upsertExportReportMetaData({
          s3Data,
          downloadedDate,
          type
        })
      )
    } catch (err) {
      logger.error({ err, ...logSourceInfo('EXPORT') }, 'Error while export uploading')
    }
  }

  async getExportReports(params) {
    const queryParams = {
      raw: true,
      attributes: [
        ['id', 'uid'],
        'type',
        'channel',
        'startTime',
        'endTime',
        'status',
        'comment'
      ]
    }
    let limit, page, where = {}
    if (params.limit) {
      ({ limit, page = 1 } = params)
      queryParams.offset = (page - 1) * limit
      queryParams.limit = limit
    }

    if (params.from) {
      where.startTime = { [Op.gte]: new Date(params.from).getTime() }
    }

    if (params.to) {
      where.startTime = { [Op.lte]: new Date(params.to).getTime() }
    }

    if (params.status) {
      where.status = { [Op.eq]: params.status }
    }

    if (params.type) {
      where.type = { [Op.eq]: params.type }
    }

    if (params.channel) {
      where.channel = { [Op.eq]: params.channel }
    }

    queryParams.where = where
    logger.debug({ queryParams }, 'Export report query params')
    const data = await getExportReports(queryParams)

    if (params.limit) {
      const count = await getExportReportsCount({ where })
      const metadata = {
        count: parseInt(count),
        page: parseInt(page),
        limit: parseInt(limit)
      }

      return {
        data,
        metadata
      }
    }

    return data
  }

  async getExportReportById(id) {
    return getExportReportById(id)
  }

  async putComment(id, comment) {
    const exportData = await this.getExportReportById(id)
    if (!exportData) {
      logger.info({ id }, 'No such export data exists. Comment not added')
      return false
    }
    exportData.comment = comment
    return upsertExportReport(exportData)
  }

}

module.exports = new ProductExportService()
