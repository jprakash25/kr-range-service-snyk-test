const Sequelize = require('sequelize')

const family = sequelize => sequelize.define('family', {
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
    },
    unique: 'unique_family'
  },
  family_name: {
    allowNull: true,
    type: Sequelize.STRING,
  },
  family_code: {
    allowNull: true,
    type: Sequelize.STRING,
    unique: 'unique_family'
  },
  class_name: {
    allowNull: true,
    type: Sequelize.STRING
  },
  class_code: {
    allowNull: true,
    type: Sequelize.STRING,
    unique: 'unique_family'
  },
  subclass_name: {
    allowNull: true,
    type: Sequelize.STRING
  },
  subclass_code: {
    allowNull: true,
    type: Sequelize.STRING,
    unique: 'unique_family'
  },
  is_valid: {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
}, {
  indexes: [
    {
      name: 'index_family_class_name',
      fields: ['class_name']
    },
    {
      name: 'index_family_subclass_name',
      fields: ['subclass_name']
    }
  ],
  timestamps: false,
  underscored: false,
  freezeTableName: true
}
)

module.exports = family
