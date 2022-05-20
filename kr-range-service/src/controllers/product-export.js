const productExportService = require('../service/product-exports.service')
const { logger } = require('../service/logger.service')
const { S3 } = require('../lib/aws')
const { logSourceInfo } = require('../config')

class ProductExportController {
  downloadExpiry = +process.env.EXPORT_SIGNED_URL_EXPIRY || 2 * 1000 * 60
  allowedExportTypes = ['AP', 'GM', 'ALL']
  export() {
    return async (req, res) => {
      let type = (req.body.type ? req.body.type : 'ALL').toUpperCase()
      let channel = req.body.channel?.toLowerCase()
      if (!this.allowedExportTypes.some((exportType) => exportType === type)) {
        logger.info({ 'type': type }, 'Invalid export type')
        res.status(400).json({ 'error': 'Invalid export type' })
        return
      }
      if (!channel) {
        logger.info({ 'channel': channel }, 'Channel is null')
        res.status(400).json({ 'error': 'Channel is null' })
        return
      }
      const exportData = await productExportService.initExport({ type, channel })
      const { id: uid, status } = exportData[0].dataValues
      productExportService.upload(uid)
      res.status(201).json({ status, uid })
    }
  }

  exportReports() {
    return async (req, res) => {
      const reports = await productExportService.getExportReports(req.query)
      res.status(200).json(reports)
    }
  }

  exportReportSingedUrl() {
    return async (req, res) => {
      const uid = req.params.uid
      const exportReportData = await productExportService.getExportReportById(uid)
      if (!exportReportData) {
        return res.status(422).json({ message: 'Wrong UID' })
      }

      if (exportReportData.status == 'process') {
        return res.status(200).json({ message: 'Export in process' })
      }
      const { s3Data: { Bucket, Key }, startTime, endTime, status, type, comment } = exportReportData

      const signedUrl = await S3.generateReadOnlySignedUrl(Bucket, Key, this.downloadExpiry)
      return res.status(200).json({ signedUrl, startTime, endTime, status, type, comment })
    }
  }

  // Payload: {comment: "" }
  exportPutComment() {
    return async (req, res) => {
      try {
        if (!req.body.comment && req.body.comment != '') {
          return res.status(400).json({ message: 'No comment in the body' })
        }
        const result = await productExportService.putComment(req.params.uid, req.body.comment)
        if (result) {
          return res.status(200).json({ message: result })
        }
        return res.status(422).json({ message: 'Wrong UID' })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('EXPORT') }, 'Error while adding comment')
        return res.status(400).json({ message: error })
      }
    }
  }
}


module.exports = new ProductExportController()
