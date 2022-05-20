const Sequelize = require('sequelize')

const ExportReports = sequelize => sequelize.define('export_reports', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    allowNull: false,
    type: Sequelize.ENUM,
    values: ['AP', 'GM', 'ALL'],
    field: 'type'
  },
  s3Data: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 's3_data'
  },
  startTime: {
    allowNull: false,
    type: Sequelize.BIGINT,
    field: 'start_time'
  },
  endTime: {
    allowNull: true,
    type: Sequelize.BIGINT,
    field: 'end_time'
  },
  status: {
    allowNull: false,
    type: Sequelize.STRING,
    field: 'status'
  },
  comment: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'comment'
  },
  channel: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'channel'
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = ExportReports
