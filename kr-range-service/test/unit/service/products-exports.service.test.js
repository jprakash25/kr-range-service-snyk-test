const productExportsService = require('../../../src/service/product-exports.service')
const exportReportRepository = require('../../../src/lib/repositories/export-report-repository')

jest.mock('../../../src/lib/repositories/export-report-repository')

describe('Products Export Service', () => {

  describe('Generate File Key', () => {
    let exportReportData = {
      id: 1,
      channel: 'khub',
      type: 'GM'
    }

    it('Should return correct file key', (done) => {
      let result = productExportsService.generateFileKey(exportReportData)
      expect(result).toEqual('khub-gm-product-info-1')
      done()
    })
  })

  describe('Init export', () => {
    let options = {
      channel: 'khub',
      type: 'GM'
    }

    it('Should return no error on init export', (done) => {
      let result = productExportsService.initExport(options)
      expect(result.hasOwnProperty('error')).toBe(false)
      done()
    })
  })

  describe('Get export reports', () => {
    let params = {
      from: '10/11/2020',
      to: '11/11/2020',
      status: 'process',
      type: 'GM',
      channel: 'khub'
    }

    let data = [{
      uid: 1,
      type: 'GM',
      channel: 'khub',
      startTime: 123456789,
      endTime: 234567891,
      status: 'process',
      comment: ''
    }]

    beforeEach(() => {
      exportReportRepository.getExportReports.mockImplementation(() => {
        return Promise.resolve(data)
      })
    })

    it('Should return export reports with no limit', async () => {
      let result = await productExportsService.getExportReports(params)
      expect(result).toEqual(data)
    })

    it('Should return export reports with limit', async () => {
      params.limit = 1
      exportReportRepository.getExportReportsCount.mockImplementation(() => {
        return Promise.resolve('1')
      })

      let result = await productExportsService.getExportReports(params)
      expect(result).toEqual({ data: data, metadata: { count: 1, page: 1, limit: 1 } })
    })
  })

  describe('Get export report by id', () => {

    it('Should return export report for the provided id', async () => {
      exportReportRepository.getExportReportById.mockImplementation(() => {
        return Promise.resolve([])
      })

      let result = await productExportsService.getExportReportById(1)
      expect(result).toEqual([])
    })
  })

  describe('Put comment', () => {

    it('Should return no report exists when no report for the provided id', async () => {
      exportReportRepository.getExportReportById.mockImplementation(() => {
        return Promise.resolve(undefined)
      })

      let result = await productExportsService.putComment(2, 'test')
      expect(result).toEqual(false)
    })

    it('Should return the comment added', async () => {
      let data = {
        uid: 1,
        type: 'GM',
        channel: 'khub',
        startTime: 123456789,
        endTime: 234567891,
        status: 'process',
        comment: ''
      }

      exportReportRepository.getExportReportById.mockImplementation(() => {
        return Promise.resolve(data)
      })

      exportReportRepository.upsertExportReport.mockImplementation(() => {
        return Promise.resolve(true)
      })

      let result = await productExportsService.putComment(1, 'test')
      expect(result).toEqual(true)
    })
  })
})
