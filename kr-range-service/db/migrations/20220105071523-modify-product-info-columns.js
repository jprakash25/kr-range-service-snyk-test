'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('product_info_v2', 'is_valid_product', {
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn('product_info_v2', 'exclusions', {
        type: Sequelize.JSONB
      }),
      queryInterface.addColumn('product_info_v2', 'description', {
        type: Sequelize.STRING(1000)
      }),
      queryInterface.addColumn('product_info_v2', 'status_code', {
        type: Sequelize.JSONB
      }),
      queryInterface.addColumn('product_info_v2', 'department_code', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'year', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('product_info_v2', 'season', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'sell_price', {
        type: Sequelize.JSONB
      }),
      queryInterface.addColumn('product_info_v2', 'core_range_dates', {
        type: Sequelize.JSONB
      }),
      queryInterface.addColumn('product_info_v2', 'fixture_type', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'is_dc_replenished', {
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn('product_info_v2', 'instore_presentation', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'replenishment_method', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('product_info_v2', 'keycodes', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('product_info_v2', 'created_on', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('product_info_v2', 'family_id', {
        type: Sequelize.BIGINT,
        references: {
          model: 'family',
          key: 'id'
        }
      })
    ])

    return Promise.all([
      queryInterface.addIndex('product_info_v2', ['is_valid_product'], {
        name: 'index_product_info_v2_is_valid_product'
      }),
      queryInterface.addIndex('product_info_v2', ['description'], {
        name: 'index_product_info_v2_description'
      }),
      queryInterface.addIndex('product_info_v2', ['department_code'], {
        name: 'index_product_info_v2_department_code'
      }),
      queryInterface.addIndex('product_info_v2', ['year'], {
        name: 'index_product_info_v2_year'
      }),
      queryInterface.addIndex('product_info_v2', ['season'], {
        name: 'index_product_info_v2_season'
      }),
      queryInterface.addIndex('product_info_v2', ['dss_item_number'], {
        name: 'index_product_info_v2_dss_item_number'
      }),
      queryInterface.addIndex('product_info_v2', ['created_on'], {
        name: 'index_product_info_v2_createdOn'
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.removeIndex('product_info_v2', ['is_valid_product'], {
        name: 'index_product_info_v2_is_valid_product'
      }),
      queryInterface.removeIndex('product_info_v2', ['description'], {
        name: 'index_product_info_v2_description'
      }),
      queryInterface.removeIndex('product_info_v2', ['department_code'], {
        name: 'index_product_info_v2_department_code'
      }),
      queryInterface.removeIndex('product_info_v2', ['year'], {
        name: 'index_product_info_v2_year'
      }),
      queryInterface.removeIndex('product_info_v2', ['season'], {
        name: 'index_product_info_v2_season'
      }),
      queryInterface.removeIndex('product_info_v2', ['dss_item_number'], {
        name: 'index_product_info_v2_dss_item_number'
      }),
      queryInterface.removeIndex('product_info_v2', ['created_on'], {
        name: 'index_product_info_v2_createdOn'
      }),
    ])

    return Promise.all([
      queryInterface.removeColumn('product_info_v2', 'is_valid_product', {
        type: Sequelize.BOOLEAN
      }),
      queryInterface.removeColumn('product_info_v2', 'exclusions', {
        type: Sequelize.JSONB
      }),
      queryInterface.removeColumn('product_info_v2', 'description', {
        type: Sequelize.STRING(1000)
      }),
      queryInterface.removeColumn('product_info_v2', 'status_code', {
        type: Sequelize.JSONB
      }),
      queryInterface.removeColumn('product_info_v2', 'department_code', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'year', {
        type: Sequelize.INTEGER
      }),
      queryInterface.removeColumn('product_info_v2', 'season', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'sell_price', {
        type: Sequelize.JSONB
      }),
      queryInterface.removeColumn('product_info_v2', 'core_range_dates', {
        type: Sequelize.JSONB
      }),
      queryInterface.removeColumn('product_info_v2', 'fixture_type', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'is_dc_replenished', {
        type: Sequelize.BOOLEAN
      }),
      queryInterface.removeColumn('product_info_v2', 'instore_presentation', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'replenishment_method', {
        type: Sequelize.STRING
      }),
      queryInterface.removeColumn('product_info_v2', 'keycodes', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.removeColumn('product_info_v2', 'created_on', {
        type: Sequelize.DATE
      }),
      queryInterface.removeColumn('product_info_v2', 'family_id', {
        type: Sequelize.BIGINT
      })
    ])
  }
}
