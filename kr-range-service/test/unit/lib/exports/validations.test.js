const { getOnOffRangePeriod } = require('../../../../src/lib/exports/validations')

describe('Get on/off range period', () => {
  let periodList
  beforeEach(() => {
    periodList = {
      periodCalendar: [{
        start_week_date: '13/09/2021',
        end_week_date: '19/09/2021',
        period: 'PD03WK03F22'
      },
      {
        start_week_date: '20/09/2021',
        end_week_date: '26/09/2021',
        period: 'PD03WK04F22'
      }],
      dateFound: {}
    }
  })

  it('If date is empty return empty string', (done) => {
    const result = getOnOffRangePeriod('', periodList)
    expect(result).toEqual('')
    done()
  })

  it('If date is between the range return the period', (done) => {
    const result = getOnOffRangePeriod('21/09/2021', periodList)
    expect(result).toEqual('PD03WK04F22')
    done()
  })

  it('If date is between the range return the period', (done) => {
    periodList.dateFound = { '21/09/2021': 'PD03WK04F22' }
    const result = getOnOffRangePeriod('21/09/2021', periodList)
    expect(result).toEqual('PD03WK04F22')
    done()
  })
})
