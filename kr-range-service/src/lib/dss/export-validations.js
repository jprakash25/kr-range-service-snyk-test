const _ = require('lodash')
const { getFinancialYear } = require('../../util/calendar')
const { logger } = require('../../service/logger.service')
const { logSourceInfo } = require('../../config')
/**
 * Gather all status codes from options
 * Status codes length can be zero, due to status codes can be null for all sizes
 * Status codes contains 3 or 8 then then year must be with in (current financial year - 2) (Kmart)
 * If no 3 or 8 status codes, then return true
 */
const validateProductByStatusCodes = (data) => {
  const sizes = data?.product_data?.option?.sizes
  const statusCodes = Object.values(sizes ? sizes.map(sz => sz.productStatus?.australia?.code || '') : '')

  if (statusCodes.length == 0) return false

  if (statusCodes.some(s => s.toString() === '3' || s.toString() === '8')) {
    const eventYear = parseInt(data?.product_data?.year) || 9999
    return eventYear >= (getFinancialYear() - 2)
  }

  return true
}

/**
 * RANGE-291
 * -----------------------------------------------------------
 * For Appareal, color description should not be empty or null
 * For GM, color description should not be empty or null
 */
const validateProductByColorDescription = ({ product_data }) => {
  const colourDescription = _.get(product_data, 'option.colourDescription', null)
  return colourDescription !== '' && colourDescription !== null
}

const validateProduct = (data) => {
  try {
    return validateProductByStatusCodes(data) &&
      validateProductByColorDescription(data)
  } catch (err) {
    logger.error({ err, ...logSourceInfo('EXPORT') }, 'Error on validate product')
    throw err
  }
}

module.exports = {
  validateProduct
}
