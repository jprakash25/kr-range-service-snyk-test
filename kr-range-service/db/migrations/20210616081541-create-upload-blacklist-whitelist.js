'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('upload_blacklist_whitelist', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      channel: {
        allowNull: false,
        type: Sequelize.STRING
      },
      department: {
        allowNull: false,
        type: Sequelize.STRING
      },
      family: {
        allowNull: true,
        type: Sequelize.STRING
      },
      class: {
        allowNull: true,
        type: Sequelize.STRING
      },
      subclass: {
        allowNull: true,
        type: Sequelize.STRING
      },
      subsubclass: {
        allowNull: true,
        type: Sequelize.STRING
      },
      based_on: {
        allowNull: false,
        type: Sequelize.ENUM,
        values: [
          'department',
          'family',
          'class',
          'subclass',
          'subsubclass'
        ]
      },
      is_whitelisted: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
      is_blacklisted: {
        allowNull: true,
        type: Sequelize.BOOLEAN
      },
      effective_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      expiry_date: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updated_by: {
        allowNull: true,
        type: Sequelize.STRING
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('upload_blacklist_whitelist')
  }
}
