const csv = require('fast-csv')
const highland = require('highland')
const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const https = require('https')
const fs = require('fs')
const path = require('path')
const moment = require('moment-timezone')
const _ = require('lodash')
const { S3 } = require('../lib/aws')
const { rangeServiceInputsBucket, rangeServiceInfoBucket, logSourceInfo, ipmUrl, ipmJobStatusPollInterval } = require('../config')
const { logger } = require('./logger.service')
const config = require('../config')
const { getEditableProperties, transformPropertiesIntoNameIdPair } = require('./properties.service')
const { transformEventToModel_SheetUpload, bulkInsert_SheetUpload } = require('./productProperties.service')
const { updateUploadTaggedDataStatus } = require('./upload.service')
const { extractPeriodCalendar } = require('../lib/exports/helper')
const { getBearerTokenForExternalSystem } = require('./active-directory.service')
const { getOnRangeFourWeeksLogic, convertArrayToStringParams, getRangeDateOneWeekLogic } = require('../util/tagged-products')
const { extractDataForExternalSystems, findLatestProductProperties } = require('../lib/repositories/product-properties-repository')
const { getPeriodStartDate } = require('../util/calendar')
const { convertDateToAnotherFormat, isDateLessThanAnotherDate } = require('../util/date')
const { khubIPMGroupMapping, propertiesMappingForPostgresDB } = require('../config/tagged-data')
const { updateJobStatus } = require('../lib/repositories/ipm-job-info-repository')
const { bulkInsert, bulkInsertVariations, transformTaggedDataToModel, transformTaggedVariationsToModel } = require('./kmart-product-properties.service')


let cert_file = fs.readFileSync(path.resolve(__dirname, '../certs/KmartCertROOT.cer'))
const agent = new https.Agent({
  ca: cert_file
})

const processTaggedSheet = async ({ key, uid, channelType, duplicateRowsHashMap, username }) => {
  try {
    const s3Stream = S3.s3GetObjectStream(rangeServiceInputsBucket, key)
    const editableProperties = transformPropertiesIntoNameIdPair(await getEditableProperties(channelType))
    let duplicates = []
    return new Promise((resolve) => {
      highland(s3Stream)
        .through(csv.parse({ headers: true }))
        .batch(1000)
        .map(data => removeDuplicateRecords(data, duplicates, duplicateRowsHashMap))
        .map(data => transformEventToModel_SheetUpload(data, editableProperties, username))
        .map(data => bulkInsert_SheetUpload(data))
        .errors(err => logger.error({ err }))
        .done(async () => {
          logger.info({ Message: 'Tagging process completed' })
          await updateUploadTaggedDataStatus(uid, 'completed')
          resolve({ success: true, duplicates: duplicates })
        })
    })
  } catch (error) {
    logger.error({ error, ...logSourceInfo('TAGGING') })
  }
}

const saveTaggedData = async ({ products, type, username }) => {
  try {
    if (type === 'khub') {
      const editableProperties = transformPropertiesIntoNameIdPair(await getEditableProperties(type))
      const transformedProducts = transformDataToPostgresModel(products, editableProperties, propertiesMappingForPostgresDB[type], username)
      await bulkInsert_SheetUpload(transformedProducts)
    } else {
      const transformedProducts = transformTaggedDataToModel(products, username)
      const transformTaggedProductsVariations = transformTaggedVariationsToModel(products, username)
      await bulkInsert(transformedProducts)
      await bulkInsertVariations(transformTaggedProductsVariations)
    }
    logger.info('Products tagged in Postgres DB')
  } catch (err) {
    logger.error({ err, ...logSourceInfo('OTHERS') }, 'Error while saving tagged products')
    throw new Error('Error while saving tagged products')
  }
}

const transformDataToPostgresModel = (data, editableProperties, propertiesMapping, username) => {
  let transformedData = data.map(d => {
    return Object.keys(propertiesMapping).map(property => {
      if (d.tagged_data[property] || d.tagged_data[property] == 0) {
        return {
          productId: d.product_id,
          sourceId: d.source_id,
          propertyId: parseInt(editableProperties[propertiesMapping[property]]),
          propertyValue: d.tagged_data[property],
          username: username || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    })
  }).flat()
  return transformedData.filter(Boolean)
}

const removeDuplicateRecords = (data, duplicates, duplicateRowsHashMap) => {
  return data.filter(d => {
    if (d.Keycode) {
      if (duplicateRowsHashMap[d.Keycode] > 1) {
        duplicates.push(d)
        return false
      }
    } else {
      if (duplicateRowsHashMap[`${d['Kmart Style ID']}${d['Primary Color']}${d['Secondary Color']}`] > 1) {
        duplicates.push(d)
        return false
      }
    }
    return true
  })
}

const extractData = async (lastTriggerTime) => {
  if (!lastTriggerTime) {
    throw new Error('Last trigger time is not defined')
  }
  let productProperties = await findLatestProductProperties(lastTriggerTime)
  let periodData = await extractPeriodCalendar()
  let data = []
  if (productProperties?.length > 0) {
    let productIds = new Set(productProperties.map(p => p.productId))
    let sourceIds = new Set(productProperties.map(p => p.sourceId))
    let filter = `product_id IN (${convertArrayToStringParams(Array.from(productIds))}) AND source_id IN (${convertArrayToStringParams(Array.from(sourceIds))})`
    data = await extractDataForExternalSystems(filter)
  }
  let dataOfFailedProducts = []
  logger.info({ data }, 'data after extraction')
  if (data?.length > 0) {
    data = dataToOutputModel(data, periodData)
    await S3.putObject(rangeServiceInfoBucket, `kris/khub/kris_data_${moment(new Date()).format('YYYYMMDD')}.json`, JSON.stringify(data))
  }
  const failedData = await S3.s3GetObject(rangeServiceInfoBucket, 'ipm/khub/failed_products.json').promise()
  let productsToRetry = JSON.parse(Buffer.from(failedData.Body).toString())
  if (productsToRetry.length > 0) {
    let product_ids = new Set(productsToRetry.map(p => p.product_id))
    let source_ids = new Set(productsToRetry.map(p => p.source_id))
    let filter = `product_id IN (${convertArrayToStringParams(Array.from(product_ids))}) AND source_id IN (${convertArrayToStringParams(Array.from(source_ids))})`
    dataOfFailedProducts = await extractDataForExternalSystems(filter)
    logger.info({ dataOfFailedProducts }, 'data after extracting failed data')
  }
  if (data?.length > 0 || dataOfFailedProducts?.length > 0) {
    await rangeIPMProcessor([...data, ...dataToOutputModel(dataOfFailedProducts, periodData)])
  }
  else {
    logger.info(`No data to be sent to IPM - ${moment(new Date()).format('YYYYMMDD')}`)
  }
  return [...data, ...dataOfFailedProducts]
}

const dataToOutputModel = (products, periodData) => {
  let groupedProducts = _.groupBy(products, d => d.optionId + ':' + d.dssRefNo)

  return Object.keys(groupedProducts).map(groupKey => {
    let onRangeDate = ''
    let offRangeDate = ''
    let filteredProducts = groupedProducts[groupKey].filter(product => {
      if (product.name === 'KHUB ON RANGE DATE') {
        onRangeDate = getPeriodStartDate(product.property_value, periodData)
      } else if (product.name === 'KHUB OFF RANGE DATE') {
        offRangeDate = getPeriodStartDate(product.property_value, periodData)
      } else {
        return true
      }
      return false
    })

    return filteredProducts.map(product => {
      let { is_registered, core_range_dates, name, property_value, keycodeType, keycode, styleId, ...data } = product
      return {
        onRangeDate: onRangeDate,
        offRangeDate: offRangeDate,
        channel: 'K_HUB',
        integrationStatus: is_registered ? 'Registered' : 'Pre-Registered',
        fleet_on_range: core_range_dates.core_on_range_date,
        fleet_off_range: core_range_dates.core_off_range_date,
        subChannel: khubIPMGroupMapping[name],
        isRanged: property_value == 'Y',
        keycode: keycodeType.toLowerCase() === 'single' ? keycode : '',
        styleId: keycodeType.toLowerCase() === 'single' ? '' : styleId,
        keycodeType: keycodeType,
        ...data
      }
    }).flat()
  }).flat()
}

const rangeIPMProcessor = async (data) => {
  const { accessToken } = await getBearerTokenForExternalSystem(`${config.adCredentials.ipmClientId}/.default`)
  data = filterRegisteredProducts(data)
  const { dataWithOnRangeNotNull, dataWithFleetOnRange } = filterByOnOffRange(data)
  data = [dataWithOnRangeNotNull, findOnRangeDate(dataWithFleetOnRange)].flat()
  let failedData = []
  logger.info({ data }, 'data after date validations')
  let ipmModel = dataToIPMModel(data)
  const groupIds = Object.keys(ipmModel) || []
  logger.info({ ipmModel }, 'ipm model')
  try {
    if (groupIds.length > 0) {
      await S3.putObject(rangeServiceInfoBucket, `ipm/khub/delta/${moment(new Date()).format('YYYYMMDD')}.json`, JSON.stringify(ipmModel))
      const jobGuid = uuidv4()
      await updateIpmJobStatus(jobGuid)
      for (const group of groupIds) {
        try {
          const response = await axios.post(`${ipmUrl}/api/ranging/groups/${group}/parameters?jobId=${jobGuid}`,
            ipmModel[group], {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            httpsAgent: agent
          })
          const ipmResponse = response.data
          logger.info({ ipmResponse }, 'Response from IPM')
        } catch (error) {
          failedData = [
            ...failedData,
            ...error.response.data
          ]
        }
      }
      failedData = _.uniqWith(failedData, _.isEqual)
      logger.info({ failedData }, 'Failed data (will be retried tomorrow)')
      if (failedData.length > 0) await S3.putObject(rangeServiceInfoBucket, 'ipm/khub/failed_products.json', JSON.stringify(getFailedProducts(failedData, data)))
      pollIpmJobStatus(jobGuid)
    } else {
      logger.info('No data sent to IPM')
    }
  } catch (error) {
    logger.error(error, 'outer catch')
  }
}

const getFailedProducts = (error, data) => {
  let failedProducts_keycode = {}
  let failedProducts_style = {}
  let errorMessageToSearchFor = 'Not ranged for any standard stores'
  if (error.length > 0) {
    error.forEach(err => {
      if (err.error === errorMessageToSearchFor) {
        if (err.keycode) {
          const { optionId, dssRefNo } = _.find(data, { keycode: parseInt(err.keycode) })
          failedProducts_keycode[err.keycode] = { source_id: dssRefNo, product_id: optionId }
        }
        else if (err.styleId) {
          let optionInfo = `${err.styleId}${err.primaryColour}${err.secondaryColour}`
          const { optionId, dssRefNo } = _.find(data, { styleId: parseInt(err.styleId), primaryColor: err.primaryColour, secondaryColor: err.secondaryColour })
          failedProducts_style[optionInfo] = { source_id: dssRefNo, product_id: optionId }
        }
      }
    })
  }
  return [...Object.values(failedProducts_keycode), ...Object.values(failedProducts_style)]
}

const updateIpmJobStatus = async (jobId, status) => {
  let model = [{
    status: status || 'Processing',
    jobId: jobId,
    type: 'khub',
    createdAt: new Date(),
    updatedAt: new Date()
  }]
  return updateJobStatus(model)
}

const pollIpmJobStatus = async (jobId) => {
  const jobStatusInterval = setInterval(async () => {
    try {
      const { accessToken } = await getBearerTokenForExternalSystem(`${config.adCredentials.ipmClientId}/.default`)
      const result = await axios.get(`${ipmUrl}/api/ranging/status?jobId=${jobId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        httpsAgent: agent
      })
      logger.info(`IPM job id ${jobId} is ${result?.data?.status}`)
      if (result?.data?.status === 'Completed' || result?.data?.status === 'CompletedWithErrors') {
        await updateIpmJobStatus(jobId, result?.data?.status)
        clearInterval(jobStatusInterval)
        if (result?.data?.status === 'CompletedWithErrors') {
          const polledErrors = await axios.get(`${ipmUrl}/api/ranging/errors?jobId=${jobId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            httpsAgent: agent
          })
          await S3.putObject(rangeServiceInfoBucket, `ipm/khub/failed_jobs/${jobId}_${moment(new Date()).format('YYYYMMDD')}.json`, JSON.stringify(polledErrors.data.apply_parameters_errors))
        }
      } else if (!result?.data?.status) {
        await updateIpmJobStatus(jobId, 'ValidationError')
        clearInterval(jobStatusInterval)
      }
    } catch (err) {
      logger.error({ err, ...logSourceInfo('EXTERNAL_TRIGGER') }, 'Error while fetching IPM job status')
    }
  }, ipmJobStatusPollInterval)
}

const dataToIPMModel = (data) => {
  return data.reduce((acc, obj) => {
    const key = obj.subChannel
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(
      {
        ranged: obj.isRanged,
        on_range: obj.isRanged ? convertDateToAnotherFormat(obj?.onRangeDate) : convertDateToAnotherFormat(getVerifiedOnRangeDate(obj?.onRangeDate)),
        off_range: obj.isRanged ? convertDateToAnotherFormat(obj?.offRangeDate || obj?.fleet_off_range) : '',
        active: obj.isRanged,
        keycode: obj.keycode || null,
        styleId: obj.styleId || null,
        primaryColour: obj.primaryColor,
        secondaryColour: obj.secondaryColor
      })
    return acc
  }, {})
}

const getVerifiedOnRangeDate = (date) => {
  if (isDateLessThanAnotherDate(date, new Date())) {
    return getRangeDateOneWeekLogic()
  }
  return date
}

const findOnRangeDate = (data) => {
  data.forEach(d => {
    if (isDateLessThanAnotherDate(d.fleet_on_range, new Date())) {
      const mondayAfterFourWeeks = getOnRangeFourWeeksLogic()
      let date = d?.offRangeDate ? d.offRangeDate : d.fleet_off_range
      if (!date || (date && isDateLessThanAnotherDate(mondayAfterFourWeeks, date))) {
        d.onRangeDate = mondayAfterFourWeeks
        d.excluded = false
      } else if (date && !isDateLessThanAnotherDate(mondayAfterFourWeeks, date)) {
        d.excluded = true
      }
    } else {
      d.onRangeDate = d.fleet_on_range
      d.excluded = false
    }
  })

  return data.filter(d => d.excluded == false)
}

const filterRegisteredProducts = (data) => {
  return data.filter(d => (d.integrationStatus).toLowerCase() == 'registered')
}

const filterByOnOffRange = (data) => {
  const dataWithOnRangeNotNull = data.filter(d => d?.onRangeDate)
  const dataWithoutOnRange = data.filter(d => !d?.onRangeDate)
  const dataWithFleetOnRange = dataWithoutOnRange.filter(d => d?.fleet_on_range)

  return {
    dataWithOnRangeNotNull,
    dataWithFleetOnRange
  }
}

module.exports = {
  processTaggedSheet,
  extractData,
  pollIpmJobStatus,
  getFailedProducts,
  saveTaggedData
}
