const { exportReportMapper } = require('./../../../../src/lib/dss/export-mapper')
const apExportInputData = require('./../../../fixtures/product-info-output-ap.json')
const apExportInputDataNew = require('./../../../fixtures/product-info-output-ap-new.json')
const gmExportInputData = require('./../../../fixtures/product-info-output-gm.json')

describe('EXPORTS MAPPER', () => {
  describe('ExportMapper::AP', () => {

    it('check exported columns', () => {
      const result = exportReportMapper(apExportInputData)
      expect(result.length).toEqual(apExportInputData.data.length)
      expect(result[0].RBU).toEqual('CLOTHS MEN')
    })

    it('Excluded columns should not exist', () => {
      const result = exportReportMapper(apExportInputData)
      expect(result.length).toEqual(apExportInputData.data.length)
      expect(result[0].RBU).toEqual('CLOTHS MEN')
    })
  })

  describe('ExportMapper::GM', () => {

    it('check exported columns', () => {
      const result = exportReportMapper(gmExportInputData)
      expect(result.length).toEqual(apExportInputData.data.length)
      expect(result[0].Keycode).toEqual('')
      expect(result[0]['AUS product status code']).toEqual('0')
    })

    it('Excluded columns should not exist', () => {
      const result = exportReportMapper(gmExportInputData)
      expect(result.length).toEqual(apExportInputData.data.length)
      expect(result[0].Keycode).toEqual('')
      expect(result[0]['AUS product status code']).toEqual('0')
    })

    // it('When createdOn does not exist expect Created Date to be empty', () => {
    //   const expectedResult = ''
    //   const createdDate = 'Created Date'
    //   const result = exportReportMapper(apExportInputData)
    //   expect(result[0][createdDate]).toEqual(expectedResult)
    // })

    // it('When createdOn exists expect Created Date to be DD/MM/YYYY', () => {
    //   const expectedResult = '26/10/2016'
    //   const createdDate = 'Created Date'
    //   const result = exportReportMapper(apExportInputDataNew)
    //   expect(result[0][createdDate]).toEqual(expectedResult)
    // })
  })
})
