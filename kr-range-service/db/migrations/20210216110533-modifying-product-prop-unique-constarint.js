'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('product_properties', 'unique_product_id_property_id')
    return queryInterface.addConstraint('product_properties', {
      type: 'unique',
      name: 'unique_product_id_property_id_source_id',
      fields: ['product_id', 'property_id', 'source_id']
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('product_properties', 'unique_product_id_property_id_source_id')
    return queryInterface.addConstraint('product_properties', {
      type: 'unique',
      name: 'unique_product_id_property_id',
      fields: ['product_id', 'property_id']
    })
  }
}
