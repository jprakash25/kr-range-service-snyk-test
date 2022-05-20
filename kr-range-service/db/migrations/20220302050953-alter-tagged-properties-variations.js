'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('tagged_properties_variations', 'has_country_variations', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'country_variations_properties', {
        type: Sequelize.JSONB,
        allowNull: true
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'has_climatic_variations', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'climatic_variations_properties', {
        type: Sequelize.JSONB,
        allowNull: true
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'has_state_variations', {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'state_variations_properties', {
        type: Sequelize.JSONB,
        allowNull: true
      }),
      queryInterface.addColumn('tagged_properties_variations', 'username', {
        type: Sequelize.STRING
      })
    ])
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('tagged_properties_variations', 'has_country_variations', {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'country_variations_properties', {
        type: Sequelize.JSONB,
        allowNull: false
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'has_climatic_variations', {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'climatic_variations_properties', {
        type: Sequelize.JSONB,
        allowNull: false
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'has_state_variations', {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }),
      queryInterface.changeColumn('tagged_properties_variations', 'state_variations_properties', {
        type: Sequelize.JSONB,
        allowNull: false
      }),
      queryInterface.removeColumn('tagged_properties_variations', 'username', {
        type: Sequelize.STRING
      })
    ])
  }
}
