'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('kmart_product_properties', {
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
      tagged_properties: {
        allowNull: false,
        type: Sequelize.JSONB
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
    return queryInterface.addConstraint('kmart_product_properties', {
      type: 'unique',
      name: 'unique_product_id_source_id',
      fields: ['product_id', 'source_id']
    })
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('kmart_product_properties', 'unique_product_id_source_id')
    return queryInterface.createTable('kmart_product_properties')
  }
}
