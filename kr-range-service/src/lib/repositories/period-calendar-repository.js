const models = require('../models')
const { where, literal, Op } = require('sequelize')
const moment = require('moment-timezone')

exports.getPeriodCalendar = async () => {
  const { period_calendar } = models()
  const params = {
    attributes: [
      ['acc_start_week_date', 'start_week_date'],
      ['acc_end_week_date', 'end_week_date'],
      ['pwf', 'period']
    ],
    raw: true
  }

  return period_calendar.findAll(params)
}

exports.getPeriodList = async (limit) => {
  const { period_calendar } = models()
  const params = {
    where: where(
      literal('TO_DATE(acc_start_week_date, \'DD/MM/YYYY\')'), {
      [Op.gte]: moment().tz('Australia/Sydney').subtract(1, 'week').format('YYYY-MM-DD')
    }),
    limit: limit,
    attributes: [
      ['acc_start_week_date', 'start_week_date'],
      ['acc_end_week_date', 'end_week_date'],
      ['pwf', 'period']
    ],
    raw: true
  }

  return period_calendar.findAll(params)
}

exports.truncate = async (transactionId) => {
  const { period_calendar } = models()
  return period_calendar.destroy({
    where: {},
    transaction: transactionId
  })
}

exports.bulkInsert = async (data, transactionId) => {
  const { period_calendar } = models()
  return period_calendar.bulkCreate(data, { transaction: transactionId })
}
