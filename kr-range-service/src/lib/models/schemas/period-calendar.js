const Sequelize = require('sequelize')

const PeriodCalendar = sequelize => sequelize.define('period_calendar', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  acc_year: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  acc_period: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  acc_week: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  acc_start_week_date: {
    allowNull: false,
    type: Sequelize.STRING
  },
  acc_end_week_date: {
    allowNull: false,
    type: Sequelize.STRING
  },
  acc_week_relative: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  acc_quarter: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  gregorian_year: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  gregorian_week: {
    allowNull: false,
    type: Sequelize.INTEGER
  },
  pwf: {
    allowNull: false,
    type: Sequelize.STRING
  }
}, {
  timestamps: false,
  underscored: true,
  freezeTableName: true
})

module.exports = PeriodCalendar
