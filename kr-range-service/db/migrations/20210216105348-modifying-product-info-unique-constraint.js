'use strict'

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('product_info', 'unique_product_info_record')
    return queryInterface.addConstraint('product_info', {
      type: 'unique',
      name: 'unique_product_info_record_combination',
      fields: ['source_id', 'product_id']
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('product_info', 'unique_product_info_record_combination')
    return queryInterface.addConstraint('product_info', {
      type: 'unique',
      name: 'unique_product_info_record',
      fields: ['product_id']
    })
  }
}
