'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('export_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
          'AP',
          'GM',
          'ALL'
        ]
      },
      s3_data: {
        allowNull: true,
        type: Sequelize.JSONB
      },
      start_time: {
        allowNull: false,
        type: Sequelize.BIGINT
      },
      end_time: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
          'completed',
          'process'
        ]
      },
      comment: {
        allowNull: true,
        type: Sequelize.STRING
      }
    })
  },
  down: async (queryInterface) => queryInterface.dropTable('export_reports')
}
