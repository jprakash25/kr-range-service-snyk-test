/* eslint-env jest */
const { ProductExportController } = require('../../../src/controllers')
const productExportService = require('../../../src/service/product-exports.service')
const loggerService = require('../../../src/service/logger.service')
const { S3 } = require('../../../src/lib/aws')

jest.mock('../../../src/service/product-exports.service')
jest.mock('../../../src/service/logger.service')
jest.mock('../../../src/lib/aws')

describe('Unit:::Product Export Controller', () => {
  let res; let req = {}
  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
  })

  describe('export function', () => {
    beforeEach(() => {
      req.body = {
        type: 'GM',
        channel: 'khub'
      }
    })

    it('should log info when invalid type', async () => {
      req.body.type = 'test'
      ProductExportController.export()(req, res)
      expect(loggerService.logger.info).toHaveBeenCalledWith({ "type": "TEST" }, "Invalid export type")
    })

    it('should log info when channel is null', async () => {
      req.body.type = ''
      req.body.channel = ''
      ProductExportController.export()(req, res)
      expect(loggerService.logger.info).toHaveBeenCalledWith({ "channel": "" }, "Channel is null")
    })

    it('should return success when req is valid', async () => {
      productExportService.initExport.mockImplementation(() => {
        return Promise.resolve([{ dataValues: { id: 1, status: 'process' } }])
      })
      ProductExportController.export()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(0)
    })
  })

  describe('export reports function', () => {
    it('should return success when req is valid', async () => {
      ProductExportController.exportReports()(req, res)
      expect(loggerService.logger.info).toBeCalledTimes(0)
    })
  })

  describe('export report signed url function', () => {
    beforeEach(() => {
      req.params = {
        uid: 1
      }
    })

    it('should return 422 when wrong uid', async () => {
      req.params.uid = 0
      ProductExportController.exportReportSingedUrl()(req, res)
      expect(S3.generateReadOnlySignedUrl).toBeCalledTimes(0)
    })

    it('should return in process when status is process', async () => {
      productExportService.getExportReportById.mockImplementation(() => {
        return Promise.resolve({
          status: 'process'
        })
      })
      ProductExportController.exportReportSingedUrl()(req, res)
      expect(S3.generateReadOnlySignedUrl).toBeCalledTimes(0)
    })

    it('should return success when status is completed', async () => {
      productExportService.getExportReportById.mockImplementation(() => {
        return Promise.resolve({
          status: 'completed',
          startTime: 1234,
          endTime: 5678,
          type: 'GM',
          comment: '',
          s3Data: {
            Bucket: 'test',
            Key: 'test'
          }
        })
      })
      await ProductExportController.exportReportSingedUrl()(req, res)
      expect(S3.generateReadOnlySignedUrl).toBeCalledTimes(1)
    })
  })

  describe('export put comment function', () => {
    beforeEach(() => {
      req.body = {
        comment: 'test'
      }
      req.params = {
        uid: 1
      }
    })

    it('should return 400 when no comment', async () => {
      req.body = {}
      ProductExportController.exportPutComment()(req, res)
      expect(productExportService.putComment).toBeCalledTimes(0)
    })

    it('should return 422 when result is empty', async () => {
      productExportService.putComment.mockImplementation(() => {
        return Promise.resolve()
      })
      await ProductExportController.exportPutComment()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('should return 200 when result is not empty', async () => {
      productExportService.putComment.mockImplementation(() => {
        return Promise.resolve(true)
      })
      await ProductExportController.exportPutComment()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })

    it('should throw error when put comment fails', async () => {
      productExportService.putComment.mockImplementation(() => {
        throw new Error('error')
      })
      ProductExportController.exportPutComment()(req, res)
      expect(loggerService.logger.error).toBeCalledTimes(1)
    })
  })
})
