'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('period_calendar', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      acc_year: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      acc_period: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      acc_week: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      acc_start_week_date: {
        allowNull: false,
        type: Sequelize.STRING
      },
      acc_end_week_date: {
        allowNull: false,
        type: Sequelize.STRING
      },
      acc_week_relative: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      acc_quarter: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      gregorian_year: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      gregorian_week: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      pwf: {
        allowNull: false,
        type: Sequelize.STRING
      }
    })
  },

  down: async (queryInterface) => queryInterface.dropTable('period_calendar')
}
