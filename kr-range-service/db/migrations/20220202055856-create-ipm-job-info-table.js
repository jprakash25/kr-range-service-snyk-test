'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ipm_job_info', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      job_id: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true
      },
      group_id: {
        allowNull: true,
        type: Sequelize.STRING
      },
      type: {
        allowNull: true,
        type: Sequelize.STRING
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING
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
  down: async (queryInterface) => queryInterface.dropTable('ipm_job_info')
}
