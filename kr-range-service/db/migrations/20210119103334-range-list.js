'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('range_list', {
      range_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      range_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      filter_conditions: {
        allowNull: true,
        type: Sequelize.STRING
      },
      products_list: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface) => {
    return queryInterface.createTable('range_list')
  }
}
