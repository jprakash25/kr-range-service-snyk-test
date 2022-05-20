'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('ad_test_data', {
      username: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.ENUM,
        values: ['khub', 'kmart']
      },
      has_all_dept_access: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      department_access: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      }
    })
  },
  down: async (queryInterface) => {
    return queryInterface.dropTable('ad_test_data')
  }
}
