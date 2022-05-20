/* eslint-disable no-async-promise-executor */
const Joi = require('joi').extend(require('@hapi/joi-date'))
const csv = require('fast-csv')
const { pick, find } = require('lodash')
const { columnHeaders, storeFormatCount, dateColumns } = require('../../config/tagged-data')
const { logger } = require('../../service/logger.service')
const { findProductBy } = require('../repositories/product-info-v2-repository')
const { isDateLessThanAnotherDate, dateBetween } = require('../../util/date')
const Sequelize = require('sequelize')
const { getProductProperties } = require('../repositories/product-properties-repository')
const { getPeriodStartDate } = require('../../util/calendar')

const joiValidationOptions = {
  abortEarly: false,
  allowUnknown: true
}

const csvSchema = Joi.object().keys({
  'Channel': Joi.string(),
  'Department': Joi.string().trim().required(),
  'KHUB': Joi.alternatives().conditional('Channel', { is: 'khub', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'KHUB PLUS': Joi.alternatives().conditional('Channel', { is: 'khub', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'KHUB MINUS': Joi.alternatives().conditional('Channel', { is: 'khub', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'KHUB MAX': Joi.alternatives().conditional('Channel', { is: 'khub', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'KHUB SUPER MAXX': Joi.alternatives().conditional('Channel', { is: 'khub', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'FLEET': Joi.alternatives().conditional('Channel', { is: 'kmart', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'SMALL FLEET': Joi.alternatives().conditional('Channel', { is: 'kmart', then: Joi.string().trim().valid('Y', 'N').required().allow('') }),
  'ONLINE': Joi.alternatives().conditional('Channel', { is: 'kmart', then: Joi.string().trim().valid('Y', 'N').required().allow('') })
})

const getNonEmptyTags = (row) => {
  if (row['Channel'] === 'khub') {
    return [
      row['KHUB'],
      row['KHUB PLUS'],
      row['KHUB MINUS'],
      row['KHUB MAX'],
      row['KHUB SUPER MAXX'],
    ].filter(Boolean)
  } else {
    return [
      row['FLEET'],
      row['SMALL FLEET'],
      row['ONLINE'],
    ].filter(Boolean)
  }
}

const csvValidation = (data, channelType) => {
  data['Channel'] = channelType
  let validationResult = csvSchema.validate(data, joiValidationOptions)
  const rowSpecifier = data.Keycode ? `Keycode ${data.Keycode}` : `Kmart Style ID ${data['Kmart Style ID']}`
  if (validationResult.error) {
    data.schemaError = `${rowSpecifier}: ${validationResult.error.details.map((detail) => detail.message).join(',')}`
    logger.error(`Schema validation Error: ${validationResult.error.details.map((detail) => detail.message).join(',')}`)
  }

  const nonEmptyTags = getNonEmptyTags(data)
  if (nonEmptyTags.length > 0 && nonEmptyTags.length < storeFormatCount[channelType]) {
    data.schemaError = data.schemaError ? `${data.schemaError}; All store formats should be tagged or all should be empty`
      : `${rowSpecifier}: All store formats should be tagged or all should be empty`
  }
  delete data['Channel']
  return data
}

const dataValidation = async (row, userAssociatedDepartments, channelType) => {
  return new Promise(async (resolve) => {
    if (
      (row['Primary Color'] && row['Secondary Color'] && row['Kmart Style ID'])
      || row['Keycode']
    ) {
      let productConditions = {}
      if (row['Kmart Style ID']) {
        productConditions = {
          primaryColor: {
            [Sequelize.Op.iLike]: row['Primary Color']
          },
          secondaryColor: {
            [Sequelize.Op.iLike]: row['Secondary Color']
          },
          styleNumber: row['Kmart Style ID']
        }
      } else if (row['Keycode']) {
        productConditions.keycode = row['Keycode']
      }
      const product = await findProductBy(productConditions)
      if (!product) {
        row.dataError = addDataErrorWithMoreSpecifiers(row, productConditions?.keycode ? 'No record found for this keycode' : 'No record found with a combination of these style id, primary or secondary color. If it does, please also verify correct spacing')
        logger.error({ productConditions }, 'Data validation Error: does not exist in system')
      } else {
        const additionalDataValidationsResult = additionalDataValidations(product, userAssociatedDepartments, channelType)
        if (additionalDataValidationsResult?.error) {
          row.dataError = addDataError(row, additionalDataValidationsResult.error)
        }
        row['Option ID'] = product.productId
        row['DSS ref no'] = product.sourceId
        row['FLEET ON RANGE'] = product.productData?.ipm_on_range || '31/12/1900'
        row['FLEET OFF RANGE'] = product.productData?.ipm_off_range || '31/12/9999'
        row['familyTree'] = product.productData?.familyTree
      }
    } else {
      row.dataError = addDataError(row, 'Ensure to provide value for all the required columns')
    }

    resolve(row)
  })
}

const additionalDataValidations = (product, userAssociatedDepartments, channelType) => {
  if (!product.isRegistered) {
    return {
      error: 'The product is not a registered product'
    }
  }

  if (!userAssociatedDepartments?.hasAllDepartmentAccess && channelType != 'khub') {
    if (!userAssociatedDepartments.departments.includes(product?.productData?.familyTree?.department?.code)) {
      return {
        error: `The user is not allowed to upload data for department ${product?.productData?.familyTree?.department?.code}`
      }
    }
  }

  return {
    message: 'All validations passed'
  }
}

const validateColumnHeaders = (stream, type) => {
  return new Promise((resolve) => {
    stream
      .pipe(csv.parse({ headers: true, trim: true }))
      .on('headers', (data) => {
        const headers = columnHeaders[type]
        resolve(headers.every(h => data.indexOf(h) > -1))
      })
  })
}

const onOffRangeDateValidation = async (row, periodData, channelType, propertyIdList, kmartRangeProperties) => {
  return new Promise(async (resolve) => {
    let columnData = dateColumns[channelType]
    let northernOnRangeDate, northernOffRangeDate, southernOnRangeDate, southernOffRangeDate

    let onRangeDate = getPeriodStartDate(row[columnData.onRangeDate], periodData)
    if (onRangeDate === null) {
      row.dataError = addDataError(row, `${columnData.onRangeDate} doesn't have a proper date specified`)
    }

    let offRangeDate = getPeriodStartDate(row[columnData.offRangeDate], periodData)
    if (offRangeDate === null) {
      row.dataError = addDataError(row, `${columnData.offRangeDate} doesn't have a proper date specified`)
    }

    if (onRangeDate && offRangeDate) {
      if (!isDateLessThanAnotherDate(onRangeDate, offRangeDate)) {
        row.dataError = addDataError(row, 'On range date is not less than Off range date')
      }
    }

    /*
      If On Range date is provided, there won't be Northern/Southern On range dates
      as they are mutually exclusive.
      If Off Range date is provided, there won't be Northern/Southern Off range dates
      as they are mutually exclusive.
      No need to validate further. Can return.
    */
    if (!onRangeDate) {
      northernOnRangeDate = getPeriodStartDate(row[columnData.northernOnRangeDate], periodData)
      if (northernOnRangeDate === null) {
        row.dataError = addDataError(row, `${columnData.northernOnRangeDate} doesn't have a proper date specified`)
      }

      southernOnRangeDate = getPeriodStartDate(row[columnData.southernOnRangeDate], periodData)
      if (southernOnRangeDate === null) {
        row.dataError = addDataError(row, `${columnData.southernOnRangeDate} doesn't have a proper date specified`)
      }
    }

    if (!offRangeDate) {
      northernOffRangeDate = getPeriodStartDate(row[columnData.northernOffRangeDate], periodData)
      if (northernOffRangeDate === null) {
        row.dataError = addDataError(row, `${columnData.northernOffRangeDate} doesn't have a proper date specified`)
      }

      southernOffRangeDate = getPeriodStartDate(row[columnData.southernOffRangeDate], periodData)
      if (southernOffRangeDate === null) {
        row.dataError = addDataError(row, `${columnData.southernOffRangeDate} doesn't have a proper date specified`)
      }
    }

    /*
      Compare with IPM on/off range dates only for Khub
      Compare Khub climatic range dates with Kmart (Fleet) climatic range dates
    */
    if (channelType === 'khub') {
      let kmartClimateRangeData = {}
      let productProperty
      let fleetRange = [row['FLEET ON RANGE'], row['FLEET OFF RANGE']]
      if (onRangeDate && !dateBetween({ date: onRangeDate, range: fleetRange, dateFormat: 'DD/MM/YYYY', inclusivity: '[]' })) {
        row.dataError = addDataError(row, 'On Range date does not fall between fleet on and off range dates')
      }
      if (offRangeDate && !dateBetween({ date: offRangeDate, range: fleetRange, dateFormat: 'DD/MM/YYYY', inclusivity: '[]' })) {
        row.dataError = addDataError(row, 'Off Range date does not fall between fleet on and off range dates')
      }

      const rangeProperties = await getProductProperties({ propertyIdList, productsIdList: [row['Option ID']], sourceIdList: [row['DSS ref no']] })
      rangeProperties.forEach((rangedProperty) => {
        productProperty = find(kmartRangeProperties, (property) => property.id == rangedProperty.propertyId)
        kmartClimateRangeData[productProperty.name] = rangedProperty.propertyValue
      })
      let kmartColumnData = dateColumns['kmart']

      if (northernOnRangeDate === '') {
        row[columnData.northernOnRangeDate] = kmartClimateRangeData[kmartColumnData.northernOnRangeDate]
      } else if (northernOnRangeDate) {
        let kmartNorthernOnRangeDate = getPeriodStartDate(kmartClimateRangeData[kmartColumnData.northernOnRangeDate], periodData)
        if (kmartNorthernOnRangeDate) {
          if (!isDateLessThanAnotherDate(kmartNorthernOnRangeDate, northernOnRangeDate)) {
            row.dataError = addDataError(row, 'Northern On range date is not equal or greater than Kmart (fleet) Northern On range date')
          }
        }
      }

      if (northernOffRangeDate === '') {
        row[columnData.northernOffRangeDate] = kmartClimateRangeData[kmartColumnData.northernOffRangeDate]
      } else if (northernOffRangeDate) {
        let kmartNorthernOffRangeDate = getPeriodStartDate(kmartClimateRangeData[kmartColumnData.northernOffRangeDate], periodData)
        if (kmartNorthernOffRangeDate) {
          if (!isDateLessThanAnotherDate(northernOffRangeDate, kmartNorthernOffRangeDate)) {
            row.dataError = addDataError(row, 'Northern Off range date is not equal or earlier than Kmart (fleet) Northern Off range date')
          }
        }
      }

      if (southernOnRangeDate === '') {
        row[columnData.southernOnRangeDate] = kmartClimateRangeData[kmartColumnData.southernOnRangeDate]
      } else if (southernOnRangeDate) {
        let kmartSouthernOnRangeDate = getPeriodStartDate(kmartClimateRangeData[kmartColumnData.southernOnRangeDate], periodData)
        if (kmartSouthernOnRangeDate) {
          if (!isDateLessThanAnotherDate(kmartSouthernOnRangeDate, southernOnRangeDate)) {
            row.dataError = addDataError(row, 'Southern On range date is not equal or greater than Kmart (fleet) Southern On range date')
          }
        }
      }

      if (southernOffRangeDate === '') {
        row[columnData.southernOffRangeDate] = kmartClimateRangeData[kmartColumnData.southernOffRangeDate]
      } else if (southernOffRangeDate) {
        let kmartSouthernOffRangeDate = getPeriodStartDate(kmartClimateRangeData[kmartColumnData.southernOffRangeDate], periodData)
        if (kmartSouthernOffRangeDate) {
          if (!isDateLessThanAnotherDate(southernOffRangeDate, kmartSouthernOffRangeDate)) {
            row.dataError = addDataError(row, 'Southern Off range date is not equal or earlier than Kmart (fleet) Southern Off range date')
          }
        }
      }
    }

    if (northernOnRangeDate && northernOffRangeDate) {
      if (!isDateLessThanAnotherDate(northernOnRangeDate, northernOffRangeDate)) {
        row.dataError = addDataError(row, 'Northern On range date is not less than Northern Off range date')
      }
    }

    if (southernOnRangeDate && southernOffRangeDate) {
      if (!isDateLessThanAnotherDate(southernOnRangeDate, southernOffRangeDate)) {
        row.dataError = addDataError(row, 'Southern On range date is not less than Southern Off range date')
      }
    }

    resolve(row)
  })
}

const addDataError = (row, error) => {
  const rowSpecifier = row.Keycode ? `Keycode ${row.Keycode} ` : `Kmart Style ID ${row['Kmart Style ID']} `
  if (row.dataError) {
    return `${row.dataError}, ${error}`
  } else {
    return `${rowSpecifier}: ${error}`
  }
}

const addDataErrorWithMoreSpecifiers = (row, error) => {
  const rowSpecifier = row.Keycode ? `Keycode ${row.Keycode} ` :
    `Kmart Style ID ${row['Kmart Style ID']}, Primary Color ${row['Primary Color']}, Secondary Color ${row['Secondary Color']} `
  if (row.dataError) {
    return `${row.dataError}, ${error}`
  } else {
    return `${rowSpecifier}: ${error}`
  }
}

const identifyDuplicateRecords = (row, duplicateRowsHashMap) => {
  let key
  if (row.Keycode) {
    key = row.Keycode
  } else {
    key = `${row['Kmart Style ID']}${row['Primary Color']}${row['Secondary Color']}`
  }

  if (key in duplicateRowsHashMap) {
    row.dataError = addDataErrorWithMoreSpecifiers(row, 'appears more than once. Please remove duplicate row(s)')
    duplicateRowsHashMap[key] = duplicateRowsHashMap[key] + 1
  } else {
    duplicateRowsHashMap[key] = 1
  }
  return row
}

const validateMutualExclusiveness = (row, column1, column2, errorList, passFailedRows, customMessage = null) => {
  const filteredColumn1Data = Object.values(pick(row, column1)).filter(data => data)
  const filteredColumn2Data = Object.values(pick(row, column2)).filter(data => data)

  if (filteredColumn2Data.length > 0 && filteredColumn1Data.length > 0) {
    errorList.push({
      ...row,
      dataError: addDataError(row,
        `${column1.join('/')} and ${column2.join('/')} are mutually exclusive column items${customMessage ? `.${customMessage}` : ''}`)
    })
    passFailedRows.fail++
    return false
  }
  return true
}

module.exports = {
  csvValidation,
  dataValidation,
  validateColumnHeaders,
  onOffRangeDateValidation,
  validateMutualExclusiveness,
  identifyDuplicateRecords,
  addDataErrorWithMoreSpecifiers
}
