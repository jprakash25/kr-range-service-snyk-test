'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'export_reports',
      'channel',
      {
        type: Sequelize.STRING
      }
    )
  },

  down: async (queryInterface) => {
    return queryInterface.removeColumn('export_reports', 'channel')
  }
}
