const { dateBetween } = require('../../util/date')

const getOnOffRangePeriod = (date, periodList) => {
  if (!date || date === '31/12/9999') {
    return ''
  } else {
    if (periodList.dateFound[date]) {
      return periodList.dateFound[date]
    }
    periodList.periodCalendar.some((p) => {
      if (dateBetween({ date: date, range: [p.start_week_date, p.end_week_date], dateFormat: 'DD/MM/YYYY', inclusivity: '[]' })) {
        periodList.dateFound[date] = p.period
        return true
      }
      return false
    })
    return periodList.dateFound[date]
  }
}

module.exports = {
  getOnOffRangePeriod
}
