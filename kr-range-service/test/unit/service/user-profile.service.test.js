const { acquireReleaseLock, updateUserProfile, lockState, getUserState, updateUserStateDetails } = require('../../../src/service/user-profile.service')
const userProfileRepository = require('../../../src/lib/repositories/user-profile-repository')
const userSocketRepository = require('../../../src/lib/repositories/user-socket-repository')
const loggerService = require('../../../src/service/logger.service')

jest.mock('../../../src/lib/repositories/user-profile-repository')
jest.mock('../../../src/lib/repositories/user-socket-repository')
jest.mock('../../../src/service/logger.service')
jest.mock('../../../src/lib/websocket')

describe('User Profile Service', () => {

  describe('Acquire or Release Lock', () => {
    let data

    beforeEach(() => {
      data = {
        lock: 'acquire',
        type: 'khub',
        username: 'test@test.com',
        displayName: 'test',
        clientId: 'abcd',
        associatedDepartments: {
          departments: [],
          hasAllDepartmentAccess: true
        }
      }
      userProfileRepository.updateUserProfileDetails.mockImplementation(() => {
        return Promise.resolve(true)
      })
    })

    it('Should throw error when error from db', async () => {
      data.lock = 'release'

      userProfileRepository.getUserProfileDetails.mockImplementation(() => {
        throw new Error('error')
      })
      await acquireReleaseLock(data)
        .catch(e => {
          expect(e.message).toEqual('Error: error')
        })
    })

    it('Should return display name if other user has lock', async () => {
      userProfileRepository.findLock.mockImplementation(() => {
        return Promise.resolve([{ displayName: 'test' }])
      })
      let result = await acquireReleaseLock(data)
      expect(result).toEqual('test')
    })

    it('Should return display name if other user has lock for kmart', async () => {
      data.type = 'kmart'
      userProfileRepository.findLock.mockImplementation(() => {
        return Promise.resolve([{ displayName: 'test' }])
      })
      let result = await acquireReleaseLock(data)
      expect(result).toEqual('test')
    })

    it('Should return display name if other user has lock for kmart with common department access', async () => {
      data.type = 'kmart'
      data.associatedDepartments = {
        departments: ['2', '3'],
        hasAllDepartmentAccess: false
      }
      userProfileRepository.findLock.mockImplementation(() => {
        return Promise.resolve([{ displayName: 'test', hasAllDeptAccess: false, departmentAccess: ['1', '2'] }])
      })
      let result = await acquireReleaseLock(data)
      expect(result).toEqual('test')
    })

    it('Should return display name if other user has lock for kmart with no common department access', async () => {
      data.type = 'kmart'
      data.associatedDepartments = {
        departments: ['2', '3'],
        hasAllDepartmentAccess: false
      }
      userProfileRepository.findLock.mockImplementation(() => {
        return Promise.resolve([{ displayName: 'test', hasAllDeptAccess: false, departmentAccess: ['4', '5'] }])
      })
      userProfileRepository.getUserProfileDetails.mockImplementation(() => {
        return Promise.resolve([{
          hasAllDeptAccess: false,
          departmentAccess: ['3', '4'],
          user_socket_details: [{
            socketId: '1234'
          }]
        }])
      })

      let result = await acquireReleaseLock(data)
      expect(result).toEqual(null)
    })
  })

  describe('Lock State', () => {
    it('Should throw error when db fails', async () => {
      userProfileRepository.findLock.mockImplementation(() => {
        throw new Error('error')
      })
      await lockState()
        .catch(e => {
          expect(e.message).toEqual('Error: error')
        })
    })
  })

  describe('Update User Profile', () => {
    let data = {
      type: 'khub',
      username: 'test@test.com',
      displayName: 'test',
      clientId: 'abcd',
      associatedDepartments: {
        departments: [],
        hasAllDepartmentAccess: true
      }
    }

    it('Should throw error when db fails', async () => {
      userSocketRepository.bulkCreateUserSocket.mockImplementation(() => {
        throw new Error('error')
      })
      await updateUserProfile(data)
        .catch(e => {
          expect(e.message).toEqual('Error while updating user profile')
        })
    })

    it('Should return success when update user profile is successful', async () => {
      await updateUserProfile(data)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('Update User State', () => {
    let data = {
      username: 'test@test.com',
      userState: {}
    }

    it('Should throw error when db fails', async () => {
      userProfileRepository.updateUserProfileDetails.mockImplementation(() => {
        throw new Error('error')
      })
      await updateUserStateDetails(data)
        .catch(e => {
          expect(e.message).toEqual('Error: error')
        })
    })

    it('Should return success when update user state is successful', async () => {
      await updateUserStateDetails(data)
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })

  describe('User State', () => {
    let expectedUserState = {
      location: {
        country: true,
        climatic: true,
        state: true
      }
    }
    it('Should throw error when db fails', async () => {
      userProfileRepository.getUserStateDetails.mockImplementation(() => {
        throw new Error('error')
      })
      await getUserState('test')
        .catch(e => {
          expect(e.message).toEqual('Error: error')
        })
    })

    it('Should throw error when db fails', async () => {
      userProfileRepository.getUserStateDetails.mockImplementation(() => {
        return Promise.resolve(null)
      })
      let userState = await getUserState('test')
      expect(userState).toEqual(expectedUserState)
    })
  })
})
