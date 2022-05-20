const Sequelize = require('sequelize')

const UserSocketDetails = sequelize => sequelize.define('user_socket_details', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  username: {
    allowNull: false,
    type: Sequelize.STRING,
    unique: 'unique_user_socket'
  },
  socketId: {
    allowNull: false,
    type: Sequelize.STRING,
    field: 'socket_id',
    unique: 'unqiue_user_socket'
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    field: 'created_at'
  },
  updatedAt: {
    allowNull: false,
    type: Sequelize.DATE,
    field: 'updated_at'
  }
}, {
  indexes: [
    {
      name: 'unique_user_socket',
      fields: ['username', 'socket_id'],
      unique: true
    }
  ],
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = UserSocketDetails
