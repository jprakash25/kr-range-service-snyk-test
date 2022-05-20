'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_profile', 'user_state', {
      type: Sequelize.JSONB
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('user_profile', 'user_state', {
      type: Sequelize.JSONB
    })
  }
}
