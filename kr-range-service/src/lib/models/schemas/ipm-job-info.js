const Sequelize = require('sequelize')

const IpmJobInfo = sequelize => sequelize.define('ipm_job_info', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.BIGINT
  },
  jobId: {
    allowNull: false,
    type: Sequelize.STRING,
    unique: true,
    field: 'job_id'
  },
  groupId: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'group_id'
  },
  type: {
    allowNull: true,
    type: Sequelize.STRING,
  },
  status: {
    allowNull: true,
    type: Sequelize.STRING
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
}
)

module.exports = IpmJobInfo
