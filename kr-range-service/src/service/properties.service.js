const { bulkCreate, getProperties } = require('../lib/repositories/properties-repository')

const bulkUpdate = async () => {
  const data = require('../lib/data/properties.json')
  return bulkCreate(data)
}

const getEditableProperties = async (channelType, properties) => {
  return getProperties(channelType, properties)
}

const transformPropertiesIntoNameIdPair = (properties) => {
  const transformedPropertyObj = {}
  properties.forEach(property => {
    transformedPropertyObj[property.name] = property.id
  })
  return transformedPropertyObj
}

module.exports = {
  bulkUpdate,
  getEditableProperties,
  transformPropertiesIntoNameIdPair
}
