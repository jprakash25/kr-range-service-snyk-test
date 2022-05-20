const { bulkCreate } = require('../lib/repositories/product-properties-repository')
const { logger } = require('./logger.service')

const transformEventToModel_SheetUpload = (data, editablePropertiesWithId, username) => {
  let propertiesFromSheet = Object.keys(data[0])
  const editableProperties = Object.keys(editablePropertiesWithId)
  propertiesFromSheet = propertiesFromSheet.filter(property => editableProperties.includes(property))
  return data.map(d => {
    return propertiesFromSheet.map(property => {
      return {
        productId: d['Option ID'],
        sourceId: d['DSS ref no'],
        propertyId: parseInt(editablePropertiesWithId[property]),
        propertyValue: d[property],
        username: username || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  }).flat()
}

const bulkInsert_SheetUpload = async (model) => {
  logger.info({ model }, 'Model to get added')
  return bulkCreate(model)
}

module.exports = {
  transformEventToModel_SheetUpload,
  bulkInsert_SheetUpload
}
