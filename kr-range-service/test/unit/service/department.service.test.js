/* eslint-env jest */
const { getDepartmentFilters } = require('../../../src/service/department.service')
const departmentDataRepository = require('../../../src/lib/repositories/department-data-repository')
const productInfoRespository = require('../../../src/lib/repositories/product-info-v2-repository')

jest.mock('../../../src/lib/repositories/department-data-repository')
jest.mock('../../../src/lib/repositories/product-info-v2-repository')
jest.mock('../../../src/util/tagged-products')

describe('Department Service', () => {

  describe('Get department filters', () => {
    let dbResponse = [
      {
        department_code: '001',
        department: '001 test',
        rbu_name: 'rbu1',
        rbu_code: '001',
        family_id: '001,class1,subclass1',
        class_name: 'class1',
        subclass_name: 'subclass1'
      }, {
        department_code: '001',
        department: '001 test',
        rbu_name: 'rbu1',
        rbu_code: '001',
        family_id: '001,class1,subclass2',
        class_name: 'class1',
        subclass_name: 'subclass2'
      }, {
        department_code: '001',
        department: '001 test',
        rbu_name: 'rbu1',
        rbu_code: '001',
        family_id: '001,class3,subclass3',
        class_name: 'class3',
        subclass_name: 'subclass3'
      }, {
        department_code: '002',
        department: '002 test1',
        rbu_name: 'rbu1',
        rbu_code: '001',
        family_id: '001,class2,subclass4',
        class_name: 'class2',
        subclass_name: 'subclass4'
      }
    ]
    let expectedResponse = [
      {
        _id: "001",
        name: "rbu1",
        data: [
          {
            department: "001 test",
            mappingId: "001",
            class_data: [
              {
                class_name: "class1",
                class_id: "001,class1",
                subclass_data: [
                  {
                    department_code: '001',
                    department: '001 test',
                    rbu_name: 'rbu1',
                    rbu_code: '001',
                    family_id: '001,class1,subclass1',
                    class_name: 'class1',
                    subclass_name: 'subclass1'
                  },
                  {
                    department_code: '001',
                    department: '001 test',
                    rbu_name: 'rbu1',
                    rbu_code: '001',
                    family_id: '001,class1,subclass2',
                    class_name: 'class1',
                    subclass_name: 'subclass2'
                  }
                ]
              },
              {
                class_name: "class3",
                class_id: "001,class3",
                subclass_data: [
                  {
                    department_code: '001',
                    department: '001 test',
                    rbu_name: 'rbu1',
                    rbu_code: '001',
                    family_id: '001,class3,subclass3',
                    class_name: 'class3',
                    subclass_name: 'subclass3'
                  }
                ]
              }
            ]
          },
          {
            department: "002 test1",
            mappingId: "002",
            class_data: [
              {
                class_name: "class2",
                class_id: "002,class2",
                subclass_data: [
                  {
                    department_code: '002',
                    department: '002 test1',
                    rbu_name: 'rbu1',
                    rbu_code: '001',
                    family_id: '001,class2,subclass4',
                    class_name: 'class2',
                    subclass_name: 'subclass4'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    it('Should return department filters', async () => {
      departmentDataRepository.getValidDepartmentData.mockImplementation(() => {
        return Promise.resolve(dbResponse)
      })
      productInfoRespository.getDistinctYear.mockImplementation(() => {
        return Promise.resolve([{ year: 2019 }, { year: 2020 }])
      })
      let result = await getDepartmentFilters({})
      expect(result.rbu).toEqual(expectedResponse)
      expect(result.year).toEqual([2020, 2019])
    })

    it('Should throw error when db throws error', async () => {
      departmentDataRepository.getValidDepartmentData.mockImplementation(() => {
        throw new Error('error')
      })
      await getDepartmentFilters({})
        .catch(e => {
          expect(e.message).toEqual('Error while getting filters list')
        })
    })
  })
})
