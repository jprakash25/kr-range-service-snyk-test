const Sequelize = require('sequelize')

const UploadTaggedDataInfo = sequelize => sequelize.define('upload_tagged_data_info', {
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
  channel: {
    allowNull: false,
    type: Sequelize.STRING,
    field: 'channel'
  },
  s3Data: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 's3_data'
  },
  startTime: {
    allowNull: false,
    type: Sequelize.DATE,
    field: 'start_time'
  },
  endTime: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'end_time'
  },
  status: {
    allowNull: false,
    type: Sequelize.ENUM,
    values: ['uploaded', 'process', 'completed'],
    field: 'status'
  },
  username: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'username'
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = UploadTaggedDataInfo
