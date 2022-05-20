const { checkIfProductsBlacklisted, getExclusions } = require('./../../../../src/lib/rules/whitelist-blacklist')
const { findBlacklistWhitelistKeys } = require('./../../../../src/lib/repositories/upload-blacklist-whitelist-repository')
jest.mock('./../../../../src/lib/repositories/upload-blacklist-whitelist-repository')

describe('Check blacklist logic', () => {
  let errorList = []
  let passFailedRows = null
  let blacklistWhitelist = null

  let productInfoOutput = null
  beforeEach(() => {
    findBlacklistWhitelistKeys.mockImplementation(() => ([
      'department',
      'family',
      'class',
      'subclass',
      'subsubclass'
    ]))
    passFailedRows = {
      pass: 0,
      fail: 0
    }
    errorList = []
    productInfoOutput = {
      Department: '22',
      Keycode: '42627708',
      'Primary Color': 'ASSORTED',
      'Secondary Color': 'ASSORTED',
      'Product Description': '',
      'KHUB MINUS': 'Y',
      KHUB: 'Y',
      'KHUB PLUS': 'Y',
      'KHUB MAX': 'Y',
      'KHUB SUPER MAXX': 'Y',
      familyTree: {
        class: { code: '001', name: 'GIFTS' },
        family: { code: '016', name: 'GIFTS' },
        subClass: { code: '003', name: 'FRAGRANCE' },
        department: { code: '087', name: 'COSMETICS' },
        subSubClass: { code: '001', name: 'SINGLES' }
      }
    }
    blacklistWhitelist = [{
      id: '1',
      channel: 'KHUB',
      department: '087',
      class: '001',
      subclass: '003',
      family: '016',
      subsubclass: '001',
      basedOn: 'department',
      effectiveDate: '2021-06-01T00:00:00.000Z',
      expiryDate: '2022-07-01T00:00:00.000Z',
      isWhitelisted: false,
      isBlacklisted: true,
      updatedBy: null,
      updatedAt: '2021-06-23T12:44:17.561Z'
    }]
  })

  it('product is blacklisted based on dept', async () => {
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(true)
    expect(errorList.length).toBe(1)
    expect(passFailedRows.fail).toBe(1)
  })

  it('product is not blacklisted based on dept', async () => {
    productInfoOutput.familyTree.department.code = '001'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(false)
    expect(errorList.length).toBe(0)
    expect(passFailedRows.fail).toBe(0)
  })

  it('product is part of blacklis but row is expired based on dept ', async () => {
    blacklistWhitelist[0].expiryDate = '2021-06-07T00:00:00.000Z'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(false)
    expect(errorList.length).toBe(0)
    expect(passFailedRows.fail).toBe(0)
  })

  it('product is part of blacklis but row is not effective yet based on dept', async () => {
    blacklistWhitelist[0].effectiveDate = '2022-06-01T00:00:00.000Z'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(false)
    expect(errorList.length).toBe(0)
    expect(passFailedRows.fail).toBe(0)
  })

  it('product is blacklisted based on family', async () => {
    blacklistWhitelist[0].basedOn = 'family'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(true)
    expect(errorList.length).toBe(1)
    expect(passFailedRows.fail).toBe(1)
  })

  it('product is blacklisted based on class', async () => {
    blacklistWhitelist[0].basedOn = 'class'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(true)
    expect(errorList.length).toBe(1)
    expect(passFailedRows.fail).toBe(1)
  })

  it('product is blacklisted based on subsclass', async () => {
    blacklistWhitelist[0].basedOn = 'subclass'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(true)
    expect(errorList.length).toBe(1)
    expect(passFailedRows.fail).toBe(1)
  })

  it('product is blacklisted based on subsubclass', async () => {
    blacklistWhitelist[0].basedOn = 'subsubclass'
    const isBlacklisted = await checkIfProductsBlacklisted(productInfoOutput, blacklistWhitelist, errorList, passFailedRows)
    expect(isBlacklisted).toBe(true)
    expect(errorList.length).toBe(1)
    expect(passFailedRows.fail).toBe(1)
  })
})

describe('get exclusions', () => {
  let blacklistWhitelist = null
  let productInfo = null

  beforeEach(() => {
    findBlacklistWhitelistKeys.mockImplementation(() => ([
      'department',
      'family',
      'class',
      'subclass',
      'subsubclass'
    ]))
    productInfo = {
      department_code: '087',
      family_code: '001',
      class_code: '016',
      subclass_code: '003',
      subSubClass_code: '001',
      product_source_id: '123'
    }
    blacklistWhitelist = [{
      id: '1',
      channel: 'KHUB',
      department: '087',
      class: '001',
      subclass: '003',
      family: '016',
      subsubclass: '001',
      basedOn: 'department',
      effectiveDate: '2021-06-01T00:00:00.000Z',
      expiryDate: '2022-07-01T00:00:00.000Z',
      isWhitelisted: false,
      isBlacklisted: true,
      updatedBy: null,
      updatedAt: '2021-06-23T12:44:17.561Z'
    }]
  })

  it('product is blacklisted based on dept', () => {
    let result = {
      khub: {
        khub: {
          excluded: true,
          effectiveDate: '2021-06-01T00:00:00.000Z',
          expiryDate: '2022-07-01T00:00:00.000Z',
        }
      },
      kmart: {}
    }
    const data = getExclusions(productInfo, blacklistWhitelist)
    expect(data).toEqual(result)
  })

  it('product is not blacklisted based on dept', async () => {
    let emptyResult = {
      khub: {},
      kmart: {}
    }
    productInfo.department_code = '001'
    const data = getExclusions(productInfo, blacklistWhitelist)
    expect(data).toEqual(emptyResult)
  })

  it('product is blacklisted based on dept for kmart', () => {
    let result = {
      khub: {},
      kmart: {
        kmart_fleet: {
          excluded: true,
          effectiveDate: '2021-06-01T00:00:00.000Z',
          expiryDate: '2022-07-01T00:00:00.000Z',
        }
      }
    }
    blacklistWhitelist[0].channel = 'FLEET'
    const data = getExclusions(productInfo, blacklistWhitelist)
    expect(data).toEqual(result)
  })
})
