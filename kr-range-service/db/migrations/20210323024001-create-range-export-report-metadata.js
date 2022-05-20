'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('export_report_metadata', {
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
      username: {
        allowNull: true,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      downloaded_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      s3_data: {
        allowNull: true,
        type: Sequelize.JSONB
      },
    })

    return queryInterface.addConstraint('export_report_metadata', {
      type: 'unique',
      name: 'unique_export_report_metadata',
      fields: ['email', 'type']
    })
  },
  down: async (queryInterface) => queryInterface.dropTable('export_report_metadata')
}
