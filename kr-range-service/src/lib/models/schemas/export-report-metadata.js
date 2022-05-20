const Sequelize = require('sequelize')

const ExportReportMetadata = sequelize => sequelize.define('export_report_metadata', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    allowNull: false,
    type: Sequelize.ENUM,
    values: ['AP', 'GM', 'ALL'],
    field: 'type',
    unique: 'unique_export_report_metadata'
  },
  s3Data: {
    allowNull: true,
    type: Sequelize.JSONB,
    field: 's3_data'
  },
  username: {
    allowNull: true,
    type: Sequelize.STRING,
    field: 'username'
  },
  email: {
    allowNull: false,
    type: Sequelize.STRING,
    field: 'email',
    unique: 'unique_export_report_metadata',
    defaultValue: 'user@kmartrange.com'
  },
  downloadedDate: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'downloaded_date'
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = ExportReportMetadata
