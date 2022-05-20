const { bulkCreate } = require('../lib/repositories/kmart-product-properties-repository')
const { bulkUpdateRangingVariations } = require('../lib/repositories/tagged-properties-variations-repository')
const { logger } = require('./logger.service')

const bulkInsert = async (model) => {
  logger.info({ model }, 'Model to get added')
  return bulkCreate(model)
}

const bulkInsertVariations = async (model) => {
  logger.info({ model }, 'Model to get added')
  return bulkUpdateRangingVariations(model)
}

const transformTaggedDataToModel = (data, username) => {
  return data.map(d => {
    const { core_on_range_date, core_off_range_date, core_on_range_period, core_off_range_period,
      plan_c, non_plan_c, small_fleet, online_only, aws, lspl } = d.tagged_data
    return {
      productId: d.product_id,
      sourceId: d.source_id,
      coreOnRangeDate: core_on_range_date,
      coreOffRangeDate: core_off_range_date,
      coreOnRangePeriod: core_on_range_period,
      coreOffRangePeriod: core_off_range_period,
      planC: plan_c,
      nonPlanC: non_plan_c,
      smallFleet: small_fleet,
      onlineOnly: online_only,
      aws: aws,
      lspl: lspl,
      username: username,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

const transformTaggedVariationsToModel = (data, username) => {
  return data.map(variation => {
    return {
      productId: variation.product_id,
      sourceId: variation.source_id,
      hasCountryVariations: variation.tagged_data_variations?.has_country_variations || null,
      countryVariationsProperties: variation.tagged_data_variations?.country_variations_properties || null,
      hasClimaticVariations: variation.tagged_data_variations?.has_climatic_variations || null,
      climaticVariationsProperties: variation.tagged_data_variations?.climatic_variations_properties || null,
      hasStateVariations: variation.tagged_data_variations?.has_state_variations || null,
      stateVariationsProperties: variation.tagged_data_variations?.state_variations_properties || null,
      username: username,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

module.exports = {
  bulkInsert,
  bulkInsertVariations,
  transformTaggedDataToModel,
  transformTaggedVariationsToModel
}
