'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('upload_tagged_data_info', {
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
      channel: {
        allowNull: false,
        type: Sequelize.STRING
      },
      s3_data: {
        allowNull: true,
        type: Sequelize.JSONB
      },
      start_time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      end_time: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
          'completed',
          'process'
        ]
      },
      username: {
        allowNull: true,
        type: Sequelize.STRING
      }
    })
  },
  down: async (queryInterface) => queryInterface.dropTable('upload_tagged_data_info')
}
