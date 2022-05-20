const { dateBetween, dateDiff, formatDate, isDateLessThanAnotherDate,
  convertDateToISOString, convertDateToAnotherFormat } = require('../../../src/util/date')

describe('Date Util', () => {
  describe('Date between', () => {
    let date
    let range
    let dateFormat
    let inclusivity

    beforeEach(() => {
      date = '10/11/2020'
      range = ['10/11/2020', '10/06/2021']
      dateFormat = 'DD/MM/YYYY'
      inclusivity = '[]'
    })

    it('Should return true when date is between the ranges with both boundary values inclusivity', (done) => {
      const result = dateBetween({ date, range, dateFormat, inclusivity })
      expect(result).toEqual(true)
      done()
    })

    it('Should return false when date is between the ranges with only right boundary value inclusivity', (done) => {
      inclusivity = '(]'
      const result = dateBetween({ date, range, dateFormat, inclusivity })
      expect(result).toEqual(false)
      done()
    })

    it('Should return true when date is between the ranges with right boundary value inclusivity', (done) => {
      range = ['10/10/2020', '10/11/2020']
      inclusivity = '(]'
      const result = dateBetween({ date, range, dateFormat, inclusivity })
      expect(result).toEqual(true)
      done()
    })

    it('Should return false when date is between the ranges with both boundary values not in inclusivity', (done) => {
      inclusivity = '()'
      const result = dateBetween({ date, range, dateFormat, inclusivity })
      expect(result).toEqual(false)
      done()
    })

    it('Should return true when date is null', (done) => {
      date = null
      const result = dateBetween({ date, range, dateFormat, inclusivity })
      expect(result).toEqual(true)
      done()
    })

    it('Should return true when range is empty', (done) => {
      range = [null, null]
      const result = dateBetween({ date, range, dateFormat, inclusivity })
      expect(result).toEqual(true)
      done()
    })

    it('Should throw error when range[0] is greater than range[1]', () => {
      range = ['09/11/2020', '01/11/2020']
      expect(() => {
        dateBetween({ date, range, dateFormat, inclusivity })
      }).toThrow('Date range is not proper')
    })
  })

  describe('Date diff', () => {
    let date2 = '2021-03-24T12:46:04.911+11:00'
    let date1 = '2021-03-24T04:00:27.294Z'

    it('Should return false when date1 is greater than date2', (done) => {
      const result = dateDiff({ date1, date2 })
      expect(result).toEqual(false)
      done()
    })

    it('Should return true when date1 is less than date2', (done) => {
      date2 = '2021-03-24T19:46:04.911+11:00'
      const result = dateDiff({ date1, date2 })
      expect(result).toEqual(true)
      done()
    })
  })

  describe('Format date', () => {
    const date = '2021-03-24T21:00:27.294Z'

    it('Should return default format DD/MM/YYYY in default timezone when no format, timezone is passed', (done) => {
      const result = formatDate(date)
      expect(result).toEqual('25/03/2021')
      done()
    })

    it('Should return in the requested format', (done) => {
      const result = formatDate(date, 'DD-MM-YYYY')
      expect(result).toEqual('25-03-2021')
      done()
    })

    it('Should return in the requested timezone', (done) => {
      const result = formatDate(date, 'DD-MM-YYYY', 'GMT')
      expect(result).toEqual('24-03-2021')
      done()
    })
  })

  describe('is DateLessThanAnotherDate', () => {
    let date1, date2
    beforeEach(() => {
      date1 = '01/01/2020'
      date2 = '31/12/2020'
    })

    it('should return true when date1 is less than date 2', () => {
      expect(isDateLessThanAnotherDate(date1, date2)).toBe(true)
    })

    it('should return false when date1 is not less than date 2', () => {
      date1 = '31/12/2021'
      expect(isDateLessThanAnotherDate(date1, date2)).toBe(false)
    })

    it('should return true when date1 equal to date 2', () => {
      date1 = '31/12/2020'
      expect(isDateLessThanAnotherDate(date1, date2)).toBe(true)
    })
  })

  describe('convertDateToISOString', () => {
    let date
    beforeEach(() => {
      date = '01/01/2020'
    })

    it('should return iso string when date is valid', () => {
      expect(convertDateToISOString(date)).toBe('2020-01-01T00:00:00.000Z')
    })

    it('should return empty string when empty date', () => {
      date = ''
      expect(convertDateToISOString(date)).toBe('')
    })
  })

  describe('convertDateToAnotherFormat', () => {
    let date
    beforeEach(() => {
      date = '01/01/2020'
    })

    it('should return iso string when date is valid', () => {
      expect(convertDateToAnotherFormat(date)).toBe('2020-01-01')
    })

    it('should return empty string when empty date', () => {
      date = ''
      expect(convertDateToAnotherFormat(date)).toBe('')
    })
  })

})
