/* eslint-env jest */
const { AuthorizationController } = require('../../../src/controllers')
const axios = require('axios')
const { getAssociatedDepartments, getTransitiveMemberOf } = require('../../../src/service/active-directory.service')
const loggerService = require('../../../src/service/logger.service')

jest.mock('axios')
jest.mock('../../../src/service/active-directory.service')
jest.mock('../../../src/service/logger.service')

describe('Authorization controller unit test case execution', () => {
  let res; const req = { user: {}, path: '/export/reports', headers: {} }; let next
  beforeEach(() => {
    jest.clearAllMocks()
    next = jest.fn()
  })

  describe('Authorize method test cases', () => {
    it('Graph api token error condition check', async () => {
      let resCheck = { 'message': 'Token can\'t be retireved for the given user' }
      req.user.groups = [1]
      req.headers['authorization'] = 'Bearer eYj0klmn' //Dummy authorization token
      axios.post.mockImplementation(() => {
        return Promise.reject({ message: 'Token can\'t be retireved for the given user', response: { status: 401 } })
      })
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              console.log(JSON.stringify(resValue))
              expect(axios.post.mock.calls.length).toBe(1)
              expect(resStatus).toBe(401)
              expect(resValue).toEqual(resCheck)
            }
          }
        }
      }
      await AuthorizationController.authorize()(req, res, next)
    })

    it('User group retrieval error condition check', async () => {
      let resCheck = { message: 'Can\'t retrieve images' }
      req.user.groups = [1]
      req.headers['authorization'] = 'Bearer eYj0klmn' //Dummy authorization token
      axios.post.mockImplementation((mockURL) => {
        if (mockURL.includes('login.microsoftonline.com'))
          return Promise.resolve({ data: { access_token: 'eKlmad0fe2' } })
        else if (mockURL.includes('graph.microsoft.com'))
          return Promise.reject({ message: 'Can\'t retrieve images', response: { status: 404 } })
        else return Promise.reject(new Error('not found'))
      })
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(axios.post.mock.calls.length).toBe(2)
              expect(resStatus).toBe(404)
              expect(resValue).toEqual(resCheck)
            }
          }
        }
      }
      await AuthorizationController.authorize()(req, res, next)
    })

    it('User role not matching condition check', async () => {
      let resCheck = { message: 'User is not allowed to access this end point' }
      req.user.groups = [1]
      req.headers['authorization'] = 'Bearer eYj0klmn' //Dummy authorization token
      axios.post.mockImplementation((mockURL) => {
        if (mockURL.includes('login.microsoftonline.com'))
          return Promise.resolve({ data: { access_token: 'eKlmad0fe2' } })
        else if (mockURL.includes('graph.microsoft.com'))
          return Promise.resolve({ data: { value: [1] } })
        else return Promise.reject(new Error('not found'))
      })
      res = {
        status: function (resStatus) {
          return {
            json: function (resValue) {
              expect(axios.post.mock.calls.length).toBe(2)
              expect(resStatus).toBe(401)
              expect(resValue).toEqual(resCheck)
            }
          }
        }
      }
      await AuthorizationController.authorize()(req, res, next)
    })

    it('Successfull validation of user access to API endpoint', async () => {
      req.user.groups = [1]
      req.params = {
        'test': 1
      }
      req.headers['authorization'] = 'Bearer eYj0klmn' //Dummy authorization token
      axios.post.mockImplementation((mockURL) => {
        if (mockURL.includes('login.microsoftonline.com'))
          return Promise.resolve({ data: { access_token: 'eKlmad0fe2' } })
        else if (mockURL.includes('graph.microsoft.com'))
          return Promise.resolve({ data: { value: ['e984e582-382c-476d-b50b-6aa700c51bbd'] } })
        else return Promise.reject(new Error('not found'))
      })
      getTransitiveMemberOf.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve([{
            'displayName': 'FT-DEPARTMENT-100'
          }])
        })
      })
      getAssociatedDepartments.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve({
            'departments': ['036']
          })
        })
      })
      await AuthorizationController.authorize()(req, res, next)
      expect(next).toHaveBeenCalled()
    })

    it('Authorization token does not exist', async () => {
      req.headers['authorization'] = ""
      AuthorizationController.authorize()(req, res, next)
      expect(loggerService.logger.error).toHaveBeenCalledWith('Authorization token does not exist')
    })
  })
})
