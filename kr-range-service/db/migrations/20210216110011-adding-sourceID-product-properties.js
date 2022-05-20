'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'product_properties',
      'source_id',
      {
        type: Sequelize.STRING
      }
    )
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('product_properties', 'source_id')
  }
}
