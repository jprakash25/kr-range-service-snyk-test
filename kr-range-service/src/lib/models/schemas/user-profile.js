const Sequelize = require('sequelize')

const UserProfile = sequelize => sequelize.define('user_profile', {
  username: {
    primaryKey: true,
    allowNull: false,
    type: Sequelize.STRING
  },
  displayName: {
    type: Sequelize.STRING,
    field: 'display_name'
  },
  storeType: {
    type: Sequelize.ENUM,
    values: ['khub', 'kmart'],
    field: 'store_type'
  },
  hasLock: {
    defaultValue: false,
    type: Sequelize.BOOLEAN,
    field: 'has_lock'
  },
  hasAllDeptAccess: {
    type: Sequelize.BOOLEAN,
    field: 'has_all_dept_access'
  },
  departmentAccess: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    field: 'department_access'
  },
  userState: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 'user_state'
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
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = UserProfile
