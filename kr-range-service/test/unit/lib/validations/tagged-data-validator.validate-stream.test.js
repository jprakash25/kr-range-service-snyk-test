/* eslint-env jest */
const { ObjectReadableMock } = require('stream-mock')
const { validateColumnHeaders } = require('../../../../src/lib/validations/tagged-data-validator')

describe('Validate coloumn headers', () => {
  it('should return false, as wrong columns for khub', async () => {
    const st = new ObjectReadableMock('a,b\na1,b1\na2,b2')
    const headers = await validateColumnHeaders(st, 'khub')
    expect(headers).toEqual(false)
  })

  it('should return false, as wrong columns for khub', async () => {
    const st = new ObjectReadableMock('K hub Base,K hub Plus\na1,b1\na2,b2')
    const headers = await validateColumnHeaders(st, 'khub')
    expect(headers).toEqual(false)
  })

  it('should return true, as all columns are included in csv for khub', async () => {
    const validColumns = ['Department', 'Product Nbr', 'Kmart Style ID', 'Keycode', 'Primary Color', 'Secondary Color',
      'Product Description', 'KHUB MINUS', 'KHUB', 'KHUB PLUS', 'KHUB MAX', 'KHUB SUPER MAXX', 'KHUB ON RANGE DATE', 'KHUB OFF RANGE DATE',
      'KHUB NORTHERN ON RANGE DATES', 'KHUB NORTHERN OFF RANGE DATES', 'KHUB SOUTHERN ON RANGE DATES', 'KHUB SOUTHERN OFF RANGE DATES']
    const st = new ObjectReadableMock(`${validColumns.join(',')}\na1,b1\na2,b2`)
    const headers = await validateColumnHeaders(st, 'khub')
    expect(headers).toEqual(true)
  })

  it('should return false, as wrong columns for kmart', async () => {
    const st = new ObjectReadableMock('a,b\na1,b1\na2,b2')
    const headers = await validateColumnHeaders(st, 'kmart')
    expect(headers).toEqual(false)
  })

  it('should return false, as wrong columns for kmart', async () => {
    const st = new ObjectReadableMock('Kmart FLEET, Kmart SMALL FLEET\na1,b1\na2,b2')
    const headers = await validateColumnHeaders(st, 'kmart')
    expect(headers).toEqual(false)
  })

  it('should return true, as all columns are included in csv for kmart', async () => {
    const validColumns = ['Department', 'Product Nbr', 'Kmart Style ID', 'Keycode', 'Primary Color', 'Secondary Color',
      'Product Description', 'FLEET', 'SMALL FLEET', 'ONLINE', 'ON RANGE DATE', 'OFF RANGE DATE', 'NORTHERN ON RANGE DATES',
      'NORTHERN OFF RANGE DATES', 'SOUTHERN ON RANGE DATES', 'SOUTHERN OFF RANGE DATES']
    const st = new ObjectReadableMock(`${validColumns.join(',')}\na1,b1\na2,b2`)
    const headers = await validateColumnHeaders(st, 'kmart')
    expect(headers).toEqual(true)
  })
})
