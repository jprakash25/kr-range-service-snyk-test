#!/usr/bin/env node
const { logger } = require('../src/service/logger.service')
const pcProcessor = require('../src/lib/input-sources/calendar/period_calendar_processor')

const main = async () => {
  try {
    logger.info('Starting period calendar data import...')
    await pcProcessor.parseAndStorePeriodCalendarData()
    logger.info('Finished importing period calendar data...')
  } catch (error) {
    console.error(`Error in importing data to period calendar, error details = ${error}`)
  }
}

main()
