/* eslint-disable no-async-promise-executor */
const moment = require('moment-timezone')
//const axios = require('axios')
const {
  saveProductInfoV2,
  deleteProductInfoV2BySourceId,
  isLatestEvent
  //updateImageUrl
} = require('../../repositories/product-info-v2-repository')
const { logger } = require('../../../service/logger.service')
//const { logSourceInfo, productServiceUrl, adCredentials } = require('../../../config')
const { logSourceInfo } = require('../../../config')
const { extractPeriodCalendar, extractRangeDataProperties } = require('../../exports/helper')
const { getOnOffRangePeriod } = require('../../exports/validations')
const { validateProduct } = require('../../dss/export-validations')
const { getExclusions } = require('../../rules/whitelist-blacklist')
const { findBlacklistWhitelistByChannels } = require('../../repositories/upload-blacklist-whitelist-repository')
const { getFamilyId } = require('../../repositories/family-data-repository')
const { getProperties } = require('../../repositories/properties-repository')
const { getKmartProductProperties } = require('../../repositories/kmart-product-properties-repository')
const { getStoreFormatsOnChannel } = require('../../../config/tagged-data')
const { getPeriodStartDate } = require('../../../util/calendar')
const { dateBetween, isDateLessThanAnotherDate } = require('../../../util/date')
const { saveTaggedData } = require('../../../service/tagging.service')
//const { getBearerTokenForExternalSystem } = require('../../../service/active-directory.service')

const eventToDbModel = async ({ event, metadata }, keycode, periodList) => {
  const {
    type, year, option: { id: productId, sizes: sizes, primaryColour, secondaryColour }, season, dssProduct,
    familyTree: { department, family, class: familyClass, subClass, subSubClass }, fixtureType, keycodeType,
    styleNumber, isDcReplenished, instorePresentation, replenishmentMethod, ...additional_product_data
  } = event

  const isValidProduct = validateProduct({ product_data: event })
  const storeChannels = getStoreFormatsOnChannel()['khub'].concat(getStoreFormatsOnChannel()['kmart'])
  const whitelistBlacklistData = await findBlacklistWhitelistByChannels(storeChannels)
  const blacklistData = whitelistBlacklistData.filter((ele) => ele.isBlacklisted)
  const exclusions = getExclusions({
    department_code: department?.code,
    family_code: family?.code,
    class_code: familyClass?.code,
    subclass_code: subClass?.code,
    subSubClass_code: subSubClass?.code
  },
    blacklistData)

  let statusCode = { australia: [], newZealand: [] }
  if (sizes) {
    sizes.map((s) => {
      if (s?.productStatus?.australia?.code) {
        statusCode.australia.push(s?.productStatus?.australia?.code)
      }
      if (s?.productStatus?.newZealand?.code) {
        statusCode.newZealand.push(s?.productStatus?.newZealand?.code)
      }
    })
  }

  let family_id = await getFamilyId({
    department_code: department?.code,
    class_name: familyClass?.name?.toUpperCase() || '',
    subclass_name: subClass?.name?.toUpperCase() || ''
  })

  let dbModel = {
    productId: productId,
    sourceId: dssProduct?.refNo,
    keycodeType: keycodeType?.toLowerCase(),
    styleNumber: styleNumber || null,
    dssItemNumber: dssProduct?.itemNo?.toUpperCase() || null,
    primaryColor: primaryColour?.name || null,
    secondaryColor: secondaryColour?.name || null,
    keycode: keycode,
    isRegistered: dssProduct?.integrationStatus?.toLowerCase() === 'registered' ? true : false,
    productData: event,
    productMetadata: metadata,
    type: type,
    updatedAt: moment().toISOString(),
    isValidProduct: isValidProduct,
    exclusions: exclusions || null,
    description: dssProduct?.itemDescription || null,
    statusCode: statusCode || null,
    departmentCode: department?.code || null,
    year: year || null,
    season: season?.name || null,
    sellPrice: {
      aus_sell_price: additional_product_data?.currentSourcingSummary?.destinationCostAndSell?.australia?.sellPriceIncGst || null,
      new_zealand_sell_price: additional_product_data?.currentSourcingSummary?.destinationCostAndSell?.newZealand?.sellPriceIncGst || null
    },
    fixtureType: fixtureType?.name || null,
    isDcReplenished: isDcReplenished !== undefined ? isDcReplenished : null,
    instorePresentation: instorePresentation?.name || null,
    replenishmentMethod: replenishmentMethod?.name || null,
    keycodes: sizes ? sizes.map((s) => s.keycodeNumber).filter(Boolean) : [],
    createdOn: dssProduct?.createdOn || null,
    family_id: parseInt(family_id.id),
    familyName: family?.name || null,
    className: familyClass?.name || null,
    subClassName: subClass?.name || null,
    subSubClassName: subSubClass?.name || null
  }

  if (type.toUpperCase() == 'AP') {
    dbModel = {
      coreRangeDates: {
        core_on_range_date: event?.bp_on_range || '',
        core_off_range_date: event?.bp_off_range || '',
        core_on_range_period: getOnOffRangePeriod(event?.bp_on_range, periodList),
        core_off_range_period: getOnOffRangePeriod(event?.bp_off_range, periodList)
      },
      ...dbModel
    }
  } else {
    dbModel = {
      coreRangeDates: {
        core_on_range_date: event?.ipm_on_range || '',
        core_off_range_date: event?.ipm_off_range || '',
        core_on_range_period: getOnOffRangePeriod(event?.ipm_on_range, periodList),
        core_off_range_period: getOnOffRangePeriod(event?.ipm_off_range, periodList)
      },
      ...dbModel
    }
    await validateKhubRangeDates({ productId, sourceId: dssProduct?.refNo, coreRangeDates: dbModel.coreRangeDates, periodData: periodList.periodCalendar })
  }

  return dbModel
}

// const getProductImageUrl = async (dssRefNo) => {
//   const { accessToken } = await getBearerTokenForExternalSystem(`api://${adCredentials.productServiceClientId}/.default`)
//   try {
//     const response = await axios.get(`${productServiceUrl}/api/v2/products/search?ExternalId=${dssRefNo}`,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${accessToken}`
//         }
//       })
//     logger.info(response?.data, 'Response from Product Service')
//     return response?.data?.[0]?.imageUrl || null
//   } catch (error) {
//     logger.error(error, 'get product image')
//   }
// }

// const updateProductImageUrl = async (dssRefNo) => {
//   const imageUrl = await getProductImageUrl(dssRefNo)
//   return updateImageUrl(dssRefNo, { imageUrl: imageUrl })
// }

const validateKhubRangeDates = async ({ productId, sourceId, coreRangeDates, periodData }) => {
  let properties = await getProperties('khub')
  let khubRangeData = await extractRangeDataProperties([{ product_id: productId, source_id: sourceId }], properties)

  if (Object.keys(khubRangeData?.[0]?.range_data)?.length > 0) {
    let khubOnRangeDate = getPeriodStartDate(khubRangeData[0].range_data['KHUB ON RANGE DATE'], periodData)
    let khubOffRangeDate = getPeriodStartDate(khubRangeData[0].range_data['KHUB OFF RANGE DATE'], periodData)
    let kmartProductProperties = await getKmartProductProperties({ productId: [productId], sourceId: [sourceId] })
    let { core_off_range_date, core_on_range_date, core_off_range_period, core_on_range_period } = kmartProductProperties?.[0] || {}
    core_off_range_date = core_off_range_date || coreRangeDates.core_off_range_date
    core_on_range_date = core_on_range_date || coreRangeDates.core_on_range_date
    core_off_range_period = core_off_range_period || coreRangeDates.core_off_range_period
    core_on_range_period = core_on_range_period || coreRangeDates.core_on_range_period
    let products = [{
      product_id: productId,
      source_id: sourceId,
      product_source_id: `${productId}${sourceId}`,
      type: 'khub',
      tagged_data: {}
    }]
    if (core_on_range_date) {
      if (khubOnRangeDate) {
        if (!dateBetween({ date: khubOnRangeDate, range: [core_on_range_date || '01/01/2000', core_off_range_date || '31/12/9999'], dateFormat: 'DD/MM/YYYY', inclusivity: '[]' })) {
          products[0].tagged_data = {
            khub_on_range_date: core_on_range_date,
            khub_on_range_period: core_on_range_period,
            ...products[0].tagged_data
          }
        }
      } else if (!isDateLessThanAnotherDate(core_on_range_date, new Date())) {
        products[0].tagged_data = {
          khub_on_range_date: core_on_range_date,
          khub_on_range_period: core_on_range_period,
          ...products[0].tagged_data
        }
      }
    }

    if (core_off_range_date) {
      if (khubOffRangeDate) {
        if (!dateBetween({ date: khubOffRangeDate, range: [core_on_range_date || '01/01/2000', core_off_range_date || '31/12/9999'], dateFormat: 'DD/MM/YYYY', inclusivity: '[]' })) {
          products[0].tagged_data = {
            khub_off_range_date: core_off_range_date,
            khub_off_range_period: core_off_range_period,
            ...products[0].tagged_data
          }
        }
      } else if (!isDateLessThanAnotherDate(core_on_range_date, new Date()) && !isDateLessThanAnotherDate(core_off_range_date, new Date())) {
        products[0].tagged_data = {
          khub_off_range_date: core_off_range_date,
          khub_off_range_period: core_off_range_period,
          ...products[0].tagged_data
        }
      }
    }

    if (Object.keys(products[0].tagged_data).length > 0) {
      await saveTaggedData({ products, type: 'khub', username: 'event' })
    }
  }
}

const validateKeycodeType = ({ event }) => {
  let keycodeType = event?.keycodeType?.toLowerCase()
  if (event?.dssProduct?.integrationStatus?.toLowerCase() === 'registered') {
    if (keycodeType === 'single') {
      let keycodeNumber = event?.option.sizes[0]?.keycodeNumber
      // If keycodetype is single, should have a keycode number
      if (!keycodeNumber) {
        logger.error({ ...logSourceInfo('CDS_DATA_PROCESSING'), optionId: event?.option.id, refNo: event?.dssProduct?.refNo }, 'Keycode is NULL for keycodetype single')
        return { isValid: false, keycode: null }
      } else {
        return { isValid: true, keycode: keycodeNumber }
      }
    } else if (keycodeType === 'style') {
      // If keycodetype is style, should have style number, primary colour and secondary colour
      if (!(event?.styleNumber && event?.option?.primaryColour?.name && event?.option?.secondaryColour?.name)) {
        logger.error({ ...logSourceInfo('CDS_DATA_PROCESSING'), optionId: event?.option.id, refNo: event?.dssProduct?.refNo }, 'Style Number or Primary color or Secondary color is NULL for keycodetype style')
        return { isValid: false, keycode: null }
      }
    } else {
      // If keycodetype is null, log error
      logger.error({ ...logSourceInfo('CDS_DATA_PROCESSING'), optionId: event?.option.id, refNo: event?.dssProduct?.refNo }, 'Keycodetype is NULL')
      return { isValid: false, keycode: null }
    }
  } else {
    // For preregistered product, get keycode for single keycodetype
    if (keycodeType === 'single') {
      return { isValid: true, keycode: event?.option.sizes[0]?.keycodeNumber }
    }
  }
  return { isValid: true, keycode: null }
}

const extractProducts = ({ products, event, metadata, source }) => {
  return products.map(product => {
    return {
      event: {
        ...product,
        ...event
      },
      metadata,
      source
    }
  })
}

const processCDSEvent = async (event) => {
  try {
    const { metadata } = event
    const sourceId = event?.event?.dssProduct?.refNo || null
    const isLatest = await isLatestEvent(sourceId, metadata.timestamp)
    if (!isLatest) {
      logger.info({ sourceId, timestamp: metadata.timestamp }, 'Event is not latest event, hence skipping CDS data')
      return false
    }

    // Delete all source ID info
    if (sourceId) {
      await deleteProductInfoV2BySourceId(sourceId)
    }

    // Extracting all products
    const products = extractProducts(event)
    logger.info({ products }, 'Extracted products')
    return Promise.all(products.map(async (product) => {
      const { isValid, keycode } = validateKeycodeType(product)
      if (!isValid) {
        logger.info(`Not a valid product for optionId: ${product?.event?.option?.id} and refNo: ${sourceId}. But saving to DB`)
      }

      const periodCalendar = await extractPeriodCalendar()
      let periodList = {
        periodCalendar,
        dateFound: {}
      }
      const dbModel = await eventToDbModel(product, keycode, periodList)

      await saveProductInfoV2(dbModel)
      //await updateProductImageUrl(dbModel.sourceId)
    })).then(() => {
      logger.info({ sourceId }, 'CDS data with ref number added to db')
    }).catch(err => {
      logger.error({ err, sourceId }, 'Error while storing CDS data to range db')
    })
  } catch (error) {
    logger.error({ error }, 'Error occured while processing core data service input event')
    throw error
  }
}

module.exports = {
  processCDSEvent
}
