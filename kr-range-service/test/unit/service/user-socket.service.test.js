const { deleteSocketId } = require('../../../src/service/user-socket.service')
const userSocketRepository = require('../../../src/lib/repositories/user-socket-repository')
const loggerService = require('../../../src/service/logger.service')

jest.mock('../../../src/lib/repositories/user-socket-repository')
jest.mock('../../../src/service/logger.service')

describe('User Socket Service', () => {

  describe('Delete Socket ID', () => {

    it('Should throw error when db fails', async () => {
      userSocketRepository.deleteSocketSessionBySocketId.mockImplementation(() => {
        throw new Error('error')
      })
      await deleteSocketId()
        .catch(e => {
          expect(e.message).toEqual('Error while deleting socket ID')
        })
    })

    it('Should return success when update user profile is successful', async () => {
      await deleteSocketId()
      expect(loggerService.logger.error).toBeCalledTimes(0)
    })
  })
})
