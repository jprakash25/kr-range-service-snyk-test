'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('department', {
      department_code: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      rbu_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      rbu_code: {
        allowNull: false,
        type: Sequelize.STRING
      },
      department_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isValid: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    })
  },
  down: async (queryInterface) => queryInterface.dropTable('department')
}
