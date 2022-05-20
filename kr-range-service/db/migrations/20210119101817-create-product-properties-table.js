'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('product_properties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      product_id: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'product_info',
          key: 'product_id'
        }
      },
      property_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'properties',
          key: 'id'
        }
      },
      property_value: {
        allowNull: false,
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date()
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },

  down: async (queryInterface) => {
    return queryInterface.createTable('product_properties')
  }
}
