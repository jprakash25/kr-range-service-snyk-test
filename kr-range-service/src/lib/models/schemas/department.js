const Sequelize = require('sequelize')

const department = sequelize => sequelize.define('department', {
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
}, {
  timestamps: false,
  underscored: false,
  freezeTableName: true
}
)

module.exports = department
