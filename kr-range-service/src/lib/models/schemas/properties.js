const Sequelize = require('sequelize')

const Properties = sequelize => sequelize.define('properties', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING,
    unique: 'unique_properties_record_combination'
  },
  type: {
    allowNull: true,
    type: Sequelize.STRING,
    unique: 'unique_properties_record_combination'
  },
  isEditable: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    field: 'is_editable'
  },
  createdAt: {
    allowNull: false,
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: new Date()
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = Properties
