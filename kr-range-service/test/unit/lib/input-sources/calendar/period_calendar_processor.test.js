const periodCalendar = require('../../../../../src/lib/input-sources/calendar/period_calendar_processor')

describe('Period Calendar Processor', () => {

  let pcColumns

  beforeEach(() => {
    pcColumns = [
      'acc_year',
      'acc_period',
      'acc_week',
      'acc_start_week_date',
      'acc_end_week_date',
      'acc_week_relative',
      'acc_quarter',
      'gregorian_year',
      'gregorian_week',
      'pwf'
    ]
  })


  describe('Validate PC Data', () => {

    it('If all required columns are present, return true', (done) => {
      let data = periodCalendar.validatePCData(pcColumns)
      expect(data).toEqual(true)
      done()
    })

    it('If all required columns are not present, return false', (done) => {
      pcColumns = []
      let data = periodCalendar.validatePCData(pcColumns)
      expect(data).toEqual(false)
      done()
    })
  })

  describe('Get required PC columns', () => {

    it('Verify it returns the required columns list', (done) => {
      let data = periodCalendar.getRequiredPCColumns()
      expect(data).toEqual(pcColumns)
      done()
    })
  })

  describe('Input to db model', () => {

    let pcData = [{
      ACC_YEAR: 21,
      ACC_PERIOD: 1,
      ACC_WEEK: 1,
      ACC_START_WEEK_DATE: '30/06/2020',
      ACC_END_WEEK_DATE: '06/07/2020',
      ACC_WEEK_RELATIVE: 1,
      ACC_QUARTER: 1,
      GREGORIAN_YEAR: 2020,
      GREGORIAN_WEEK: 27,
      PWF: 'PD01WK01F21'
    }]

    let dbModel = [{
      acc_year: 21,
      acc_period: 1,
      acc_week: 1,
      acc_start_week_date: '30/06/2020',
      acc_end_week_date: '06/07/2020',
      acc_week_relative: 1,
      acc_quarter: 1,
      gregorian_year: 2020,
      gregorian_week: 27,
      pwf: 'PD01WK01F21'
    }]

    it('Verify it returns the db model', (done) => {
      let data = periodCalendar.inputToDbModel(pcData)
      expect(data).toEqual(dbModel)
      done()
    })
  })

})
