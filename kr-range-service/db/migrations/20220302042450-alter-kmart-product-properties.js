'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('kmart_product_properties', 'tagged_properties', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'core_on_range_date', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'core_off_range_date', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'core_on_range_period', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'core_off_range_period', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'plan_c', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'non_plan_c', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'small_fleet', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'online_only', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('kmart_product_properties', 'lspl', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('kmart_product_properties', 'aws', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('kmart_product_properties', 'username', {
        type: Sequelize.STRING
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('kmart_product_properties', 'tagged_properties', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'core_on_range_date', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'core_off_range_date', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'core_on_range_period', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'core_off_range_period', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'plan_c', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'non_plan_c', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'small_fleet', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'online_only', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('kmart_product_properties', 'lspl', {
        type: Sequelize.INTEGER
      }),
      queryInterface.removeColumn('kmart_product_properties', 'aws', {
        type: Sequelize.INTEGER
      }),
      queryInterface.removeColumn('kmart_product_properties', 'username', {
        type: Sequelize.STRING
      })
    ])
  }
}
