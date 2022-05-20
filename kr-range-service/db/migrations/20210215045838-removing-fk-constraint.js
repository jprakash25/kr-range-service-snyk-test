'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('product_properties', 'product_properties_product_id_fkey')
    return queryInterface.removeConstraint('product_properties', 'product_properties_property_id_fkey')
  }
}
