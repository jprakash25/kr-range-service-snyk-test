// to be changed in future once we start reading KMART financial calendar
const getFinancialYear = () => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  if (currentMonth >= 7 && currentMonth <= 12) {
    return currentYear + 1
  } else if (currentMonth >= 1 && currentMonth <= 6) {
    return currentYear
  }
}

const getPeriodStartDate = (period, periodData) => {
  if (period) {
    let date = periodData.find(data => data['period'] == period)?.start_week_date
    if (!date) {
      return null
    }
    return date
  }
  return ''
}

module.exports = {
  getFinancialYear,
  getPeriodStartDate
}
