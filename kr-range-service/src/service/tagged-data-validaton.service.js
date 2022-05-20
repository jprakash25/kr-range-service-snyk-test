const highland = require('highland')
const { pick } = require('lodash')
const { columnData, dateColumns, kmartClimateRangeDateProperties, getStoreFormatsOnChannel } = require('../config/tagged-data')
const { csvValidation, dataValidation, validateColumnHeaders, onOffRangeDateValidation,
  validateMutualExclusiveness, identifyDuplicateRecords, addDataErrorWithMoreSpecifiers } = require('../lib/validations/tagged-data-validator')
const { processTaggedSheet } = require('./tagging.service')
const { findBlacklistWhitelistByChannels } = require('./../lib/repositories/upload-blacklist-whitelist-repository')
const { updateUploadTaggedDataStatus } = require('./upload.service')
const websocketInstance = require('../lib/websocket')
const csv = require('fast-csv')
const { logger } = require('./logger.service')
const { S3 } = require('../lib/aws')
const { getPeriodCalendar } = require('../lib/repositories/period-calendar-repository')
const { getEditableProperties } = require('../service/properties.service')
const { checkIfProductsBlacklisted } = require('./../lib/rules/whitelist-blacklist')
const { customMessages } = require('../config/tagged-data')

const transFormTaggedData = (rowData, errorList, passFailedRows, channelType) => {
  const rowInfo = pick(rowData, columnData[channelType])

  if (rowData.dataError || rowData.schemaError) {
    errorList.push({
      ...rowInfo,
      dataError: rowData.dataError ? rowData.dataError : '',
      inputError: rowData.schemaError ? rowData.schemaError : ''
    })
    passFailedRows.fail++
    return null
  } else {
    passFailedRows.pass++
    return rowInfo
  }
}

const validateAndFetchTranStream = async (inputStream, errorList, passFailedRows, channelType,
  associatedDepartments, duplicateRowsHashMap) => {
  const periodData = await getPeriodCalendar()
  const storeChannels = getStoreFormatsOnChannel()[channelType]

  const whitelistBlacklistData = await findBlacklistWhitelistByChannels(storeChannels)
  const blacklistData = whitelistBlacklistData.filter((ele) => ele.isBlacklisted)
  let data = dateColumns[channelType]
  let kmartRangeProperties
  let propertyIdList

  if (channelType === 'khub') {
    kmartRangeProperties = await getEditableProperties('kmart')
    kmartRangeProperties = kmartRangeProperties.filter(property => kmartClimateRangeDateProperties.includes(property.name))
    propertyIdList = kmartRangeProperties.map(property => property.id)
  }

  return highland(inputStream)
    .through(csv.parse({ headers: true, trim: true }))
    .filter((row) => validateMutualExclusiveness(row, ['Kmart Style ID'], ['Keycode'], errorList, passFailedRows, customMessages.customMessage1))
    .filter((row) => validateMutualExclusiveness(row, [data.onRangeDate], [data.northernOnRangeDate, data.southernOnRangeDate], errorList, passFailedRows))
    .filter((row) => validateMutualExclusiveness(row, [data.offRangeDate], [data.northernOffRangeDate, data.southernOffRangeDate], errorList, passFailedRows))
    .flatMap((row) => highland(dataValidation(row, associatedDepartments, channelType)))
    .filter((row) => !checkIfProductsBlacklisted(row, blacklistData, errorList, passFailedRows))
    .map((row) => csvValidation(row, channelType))
    .flatMap((row) => highland(onOffRangeDateValidation(row, periodData, channelType, propertyIdList, kmartRangeProperties)))
    .map((row) => identifyDuplicateRecords(row, duplicateRowsHashMap))
    .map((row) => transFormTaggedData(row, errorList, passFailedRows, channelType))
    .errors(errors => logger.error({ errors }, 'Error: validating tagged data'))
    .compact()
}
class ValidateTaggedDataService {
  /*
    input file name :  upload/AP/raw/tagged-file.csv
    output file name :
      if type is data ==> upload/AP/transformed/transformed-tagged-file.csv
      if type is error ==> upload/AP/error/error-tagged-file.csv
   */
  generateTransformedFileName(fileName, type) {
    const paths = fileName.split('/')
    const outputFileName = paths.reduce((output, path, index) => {
      if (index == paths.length - 1) { path = (type === 'data' ? `transformed-${path}` : `error-${path}`) }

      if (path === 'raw') { path = (type === 'data' ? 'transformed' : 'error') }

      return `${output}/${path}`
    })
    return outputFileName
  }

  async parseAndValidate({ bucket, key, uid, clientSessionId, channel, associatedDepartments, username }) {
    let channelType = channel
    const errorList = []
    let duplicateRowsHashMap = {}
    let passFailedRows = { pass: 0, fail: 0 }
    const transformedKeyName = this.generateTransformedFileName(key, 'data')
    const { writeStream, uploadCompletePromise } = S3.uploadStream(bucket, transformedKeyName)
    const csvStream = csv.format({ headers: true })
    const fileStream = S3.s3GetObjectStream(bucket, key)
    const headerValidation = await validateColumnHeaders(fileStream, channelType)
    if (!headerValidation) {
      logger.error('Error on column header validations')
      websocketInstance.sendToClient(clientSessionId, {
        type: 'upload',
        status: 'error',
        error: [{ error: 'Uploaded sheet does not comply with template , please  check and re-upload' }]
      })
      fileStream.destroy()
      return false
    }
    const fileStream1 = S3.s3GetObjectStream(bucket, key)
    const inputStream = await validateAndFetchTranStream(fileStream1, errorList, passFailedRows, channelType, associatedDepartments, duplicateRowsHashMap)

    await updateUploadTaggedDataStatus(uid, 'process')

    inputStream
      .pipe(csvStream)
      .pipe(writeStream)

    let s3Data = await uploadCompletePromise
    logger.info({ s3Data }, 'transformed upload finished')

    let { success, duplicates } = await processTaggedSheet({ key: transformedKeyName, uid, channelType, duplicateRowsHashMap, username })
    duplicateRowsHashMap = {}

    if (success) {
      duplicates.forEach(d => {
        errorList.push({
          ...d,
          dataError: addDataErrorWithMoreSpecifiers(d, 'appears more than once. Please remove duplicate row(s)')
        })
        passFailedRows.fail++
        passFailedRows.pass--
      })

      websocketInstance.sendToClient(clientSessionId, {
        type: 'upload',
        status: 'success',
        info: { 'pass': passFailedRows.pass, 'total': passFailedRows.pass + passFailedRows.fail }
      })

      if (errorList.length) {
        let error = null
        const errorData = errorList.map((row) => {
          error = null
          if (row.dataError)
            error = row.dataError
          if (row.inputError)
            error = error ? error += ` and ${row.inputError}` : row.inputError
          delete row.dataError
          delete row.inputError
          return {
            ...row,
            error
          }
        })
        /* send to ws client */
        websocketInstance.sendToClient(clientSessionId, {
          type: 'upload',
          status: 'error',
          error: errorData
        })

        /* publish error file to s3 */
        const transformedErrorKeyName = this.generateTransformedFileName(key, 'error')
        const csvHeaders = Object.keys(errorData[0])
        errorData.unshift(csvHeaders)
        const csvErrorStream = csv.write(errorData, { headers: true })
        s3Data = await S3.upload(bucket, transformedErrorKeyName, csvErrorStream)
        logger.info({ s3Data }, 'Error upload finished')
      } else {
        logger.info('No Errors Hence error file is not generated')
      }
    } else {
      websocketInstance.sendToClient(clientSessionId, {
        type: 'upload',
        status: 'error',
        error: [{ error: 'There was an issue while uploading tagged data. Please try again.' }]
      })
    }
  }
}

module.exports = new ValidateTaggedDataService()
