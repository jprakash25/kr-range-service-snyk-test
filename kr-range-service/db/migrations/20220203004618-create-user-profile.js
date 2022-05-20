'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_profile', {
      username: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.STRING
      },
      display_name: {
        type: Sequelize.STRING
      },
      store_type: {
        type: Sequelize.ENUM,
        values: ['khub', 'kmart']
      },
      has_lock: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      has_all_dept_access: {
        type: Sequelize.BOOLEAN
      },
      department_access: {
        type: Sequelize.ARRAY(Sequelize.STRING)
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
  down: async (queryInterface) => {
    return queryInterface.dropTable('user_profile')
  }
}
