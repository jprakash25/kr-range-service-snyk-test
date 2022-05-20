'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_info_v2', 'image_url', {
      type: Sequelize.STRING
    })
    return queryInterface.dropTable('range_list')
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('product_info_v2', 'image_url', {
      type: Sequelize.STRING
    })
  }
}
