'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('data_trigger_info', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      triggered_by: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      khub_trigger_time: {
        allowNull: true,
        type: Sequelize.DATE
      },
      kmart_trigger_time: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface) => queryInterface.dropTable('data_trigger_info')
}
