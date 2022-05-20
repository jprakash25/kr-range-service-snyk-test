const taggedDataValidationService = require('../../../src/service/tagged-data-validaton.service')

describe('Tagged Data Validation Service', () => {

  describe('Generate Transformed file name', () => {

    it('Should return transformed data file name', (done) => {
      let result = taggedDataValidationService.generateTransformedFileName('upload/AP/raw/tagged-file.csv', 'data')
      expect(result).toEqual('upload/AP/transformed/transformed-tagged-file.csv')
      done()
    })

    it('Should return transformed data file name', (done) => {
      let result = taggedDataValidationService.generateTransformedFileName('upload/AP/raw/tagged-file.csv', 'error')
      expect(result).toEqual('upload/AP/error/error-tagged-file.csv')
      done()
    })
  })
})
