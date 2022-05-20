const Sequelize = require('sequelize')

const ADTestData = sequelize => sequelize.define('ad_test_data', {
  username: {
    primaryKey: true,
    allowNull: false,
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.ENUM,
    values: ['khub', 'kmart']
  },
  hasAllDeptAccess: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    field: 'has_all_dept_access'
  },
  departmentAccess: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    field: 'department_access'
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = ADTestData
