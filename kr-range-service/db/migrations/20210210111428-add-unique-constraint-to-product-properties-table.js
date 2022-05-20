'use strict'

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.addConstraint('product_properties', {
      type: 'unique',
      name: 'unique_product_id_property_id',
      fields: ['product_id', 'property_id']
    })
  },
  down: async (queryInterface) => {
    return queryInterface.removeConstraint('product_properties',
      'unique_product_id_property_id')
  }
}
