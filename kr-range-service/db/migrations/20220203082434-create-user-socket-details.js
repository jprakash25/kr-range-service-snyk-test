'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_socket_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'user_profile',
          key: 'username'
        }
      },
      socket_id: {
        allowNull: false,
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
    return queryInterface.addConstraint('user_socket_details', {
      type: 'unique',
      name: 'unique_user_socket',
      fields: ['username', 'socket_id']
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeConstraint('unique_user_socket')
    return queryInterface.dropTable('user_socket_details')
  }
}
