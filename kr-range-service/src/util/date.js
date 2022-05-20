const moment = require('moment-timezone')

const dateBetween = (params) => {
  /* inclusivity is to check whether the boundary values should be included or excluded
    [] will include both boundary values
    () will exclude both boundary values
    [) will include left boundary value and exclude right boundary value
    (] will include right boundary value and exclude left boundary value
    If provided, both the values should be provided. By default it is ()
  */
  const { date, range, dateFormat, inclusivity } = params
  if (!date || (!range[0] && !range[1])) {
    return true
  }
  const dateRange1 = moment(range[0], dateFormat)
  const dateRange2 = moment(range[1], dateFormat)
  if (dateRange1.isAfter(dateRange2)) {
    throw new Error('Date range is not proper')
  }
  return moment(date, dateFormat).isBetween(dateRange1, dateRange2, '', inclusivity)
}

const dateDiff = (params) => {
  const { date1, date2 } = params
  const dateStr1 = new Date(date1).toString()
  const dateStr2 = new Date(date2).toString()
  return moment(new Date(dateStr1)).diff(moment(new Date(dateStr2))) < 0
}

const formatDate = (date, format = 'DD/MM/YYYY', timezone = 'Australia/Sydney') => {
  return moment(date).tz(timezone).format(format)
}

const isDateLessThanAnotherDate = (date1, date2, format = 'DD/MM/YYYY') => {
  return moment(date1, format).diff(moment(date2, format)) <= 0
}

const convertDateToISOString = (date, format = 'DD/MM/YYYY') => {
  if (date) {
    return moment.utc(date, format).toISOString()
  }
  return ''
}

const convertDateToAnotherFormat = (date, format = 'DD/MM/YYYY', expectedFormat = 'YYYY-MM-DD') => {
  if (date) {
    return moment.utc(date, format).format(expectedFormat)
  }
  return ''
}

module.exports = {
  dateBetween,
  dateDiff,
  formatDate,
  isDateLessThanAnotherDate,
  convertDateToISOString,
  convertDateToAnotherFormat
}
