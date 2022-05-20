'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('family', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      department_code: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'department',
          key: 'department_code'
        }
      },
      family_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      family_code: {
        allowNull: true,
        type: Sequelize.STRING
      },
      class_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      class_code: {
        allowNull: true,
        type: Sequelize.STRING
      },
      subclass_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      subclass_code: {
        allowNull: true,
        type: Sequelize.STRING
      },
      is_valid: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    })
  },
  down: async (queryInterface) => queryInterface.dropTable('family')
}
