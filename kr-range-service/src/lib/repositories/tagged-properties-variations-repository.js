const models = require('../models')
const { logger } = require('../../service/logger.service')

exports.bulkUpdateRangingVariations = (data) => {
  try {
    const { tagged_properties_variations } = models()
    const options = {
      fields: ['productId', 'sourceId', 'hasCountryVariations', 'countryVariationsProperties', 'hasClimaticVariations', 'climaticVariationsProperties', 'hasStateVariations', 'stateVariationsProperties', 'createdAt', 'updatedAt'],
      updateOnDuplicate: ['hasCountryVariations', 'countryVariationsProperties', 'hasClimaticVariations', 'climaticVariationsProperties', 'hasStateVariations', 'stateVariationsProperties', 'updatedAt']
    }
    return tagged_properties_variations.bulkCreate(data, options)
  } catch (error) {
    logger.error({error}, 'Error while bulk updating tagged properties variations')
    throw new Error(error)
  }
}
