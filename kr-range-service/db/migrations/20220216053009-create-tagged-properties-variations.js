'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tagged_properties_variations', {
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
      has_country_variations: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      country_variations_properties: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      has_climatic_variations: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      climatic_variations_properties: {
        allowNull: false,
        type: Sequelize.JSONB
      },
      has_state_variations: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      state_variations_properties: {
        allowNull: false,
        type: Sequelize.JSONB,
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
    return queryInterface.addConstraint('tagged_properties_variations', {
      type: 'unique',
      name: 'unique_variations_product_id_source_id',
      fields: ['product_id', 'source_id']
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('tagged_properties_variations', 'unique_variations_product_id_source_id')
    await queryInterface.dropTable('tagged_properties_variations')
  }
}
