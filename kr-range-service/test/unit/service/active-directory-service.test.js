const { getAssociatedDepartments } = require('../../../src/service/active-directory.service')
const rbuDepartmentMapping = require('../../../src/util/rbu-department-mapping')

jest.mock('../../../src/util/rbu-department-mapping')

describe('Active Directory Service', () => {

  describe('Get associated departments', () => {
    let data = [
      {
        'displayName': 'FT-ALL'
      },
      {
        'displayName': 'FT-DEPARTMENT-002'
      },
      {
        'displayName': 'FT-RBU-100'
      }
    ]

    it('Should return all department access', async () => {
      let result = await getAssociatedDepartments(data)
      expect(result.hasAllDepartmentAccess).toEqual(true)
    })

    it('Should return rbu and department access', async () => {
      data = [
        {
          'displayName': 'FT-DEPARTMENT-002'
        },
        {
          'displayName': 'FT-RBU-100'
        }
      ]
      rbuDepartmentMapping.getDepartmentsForRbus.mockImplementation(() => {
        return Promise.resolve([{ rbu: '100' }])
      })
      let result = await getAssociatedDepartments(data)
      expect(result.departments).toEqual(['002', { rbu: '100' }])
    })
  })
})
