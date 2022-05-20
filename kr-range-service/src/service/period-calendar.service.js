const memoizee = require('memoizee')
const { logger } = require('./logger.service')
const { getPeriodList } = require('../lib/repositories/period-calendar-repository')

/*
  24 hours expiry
  prefetch when 36 mins (3%) of expiry time is left
*/
let memoizedGetPeriodList = memoizee(getPeriodList, { maxAge: 24 * 60 * 60 * 1000, prefetch: 0.03 })

const extractPeriodList = async () => {
  const limit = 60
  let periodList = await memoizedGetPeriodList(limit)
  if (!periodList) {
    logger.info('Refetching period list')
    memoizedGetPeriodList.clear()
    periodList = await memoizedGetPeriodList(limit)
  }
  let offRangePeriodList = [...periodList]
  offRangePeriodList.shift()
  return { onRangePeriodList: periodList, offRangePeriodList }
}

module.exports = {
  extractPeriodList
}
