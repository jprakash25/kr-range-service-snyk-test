const Sequelize = require('sequelize')

const DataTriggerInfo = sequelize => sequelize.define('data_trigger_info', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.BIGINT
  },
  triggeredBy: {
    allowNull: false,
    type: Sequelize.STRING,
    unique: true,
    field: 'triggered_by'
  },
  khubTriggerTime: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'khub_trigger_time'
  },
  kmartTriggerTime: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'kmart_trigger_time'
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
}
)

module.exports = DataTriggerInfo
