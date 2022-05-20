/* eslint-env jest */
const { dataValidation } = require('../../../../src/lib/validations/tagged-data-validator')
const { saveProductInfoV2 } = require('../../../../src/lib/repositories/product-info-v2-repository')

describe('Data validation', () => {
  let userAssociatedDepartments = {
    hasAllDepartmentAccess: true
  }
  beforeEach(async () => {
    await saveProductInfoV2({
      productId: 'P001',
      sourceId: 'S001',
      keycodeType: 'single',
      styleNumber: 10012,
      dssItemNumber: 'ITM-001',
      primaryColor: 'BLK',
      secondaryColor: 'WHITE',
      keycode: 400001,
      isRegistered: true,
      productData: {},
      productMetadata: {},
      type: 'AP',
      updatedAt: new Date('2021-05-04')
    })
  })

  it('should be return data from db', async (done) => {
    const csvData = {
      'Kmart Style ID': 10012,
      'Primary Color': 'BLK',
      'Secondary Color': 'WHITE'
    }
    const data = await dataValidation(csvData, userAssociatedDepartments)
    expect(data).toEqual(expect.objectContaining({
      ...csvData,
      'Option ID': 'P001',
      'DSS ref no': 'S001'
    }))
    done()
  })

  it('should not return data from db, because of wrong style ID', async (done) => {
    const csvData = {
      'Kmart Style ID': 10013,
      'Primary Color': 'BLK',
      'Secondary Color': 'WHITE'
    }
    const data = await dataValidation(csvData, userAssociatedDepartments)
    expect(data).toEqual(expect.objectContaining({
      ...csvData,
      dataError: `Kmart Style ID ${csvData['Kmart Style ID']}, Primary Color ${csvData['Primary Color']}, Secondary Color ${csvData['Secondary Color']} : No record found with a combination of these style id, primary or secondary color. If it does, please also verify correct spacing`
    }))
    done()
  })

  it('should return data from db, based on keycode', async (done) => {
    const csvData = {
      'Keycode': 400001,
      'Primary Color': 'BLK',
      'Secondary Color': 'WHITE'
    }
    const data = await dataValidation(csvData, userAssociatedDepartments)
    expect(data).toEqual(expect.objectContaining({
      ...csvData,
      'Option ID': 'P001',
      'DSS ref no': 'S001'
    }))
    done()
  })
})
