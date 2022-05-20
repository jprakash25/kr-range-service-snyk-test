'use strict'

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.dropTable('product_info')
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('product_info', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      product_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      source_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      product_data: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      product_metadata: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
          'AP',
          'GM',
          'UK'
        ]
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  }
}
